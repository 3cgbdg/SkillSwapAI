import path from 'node:path';
import picomatch from 'picomatch';
import { DEFAULT_EXTENSIONS, ROOT_WORKSPACE_NAME } from './constants.js';
import { pluginNames } from './types/PluginNames.js';
import { arrayify, compact, partition } from './util/array.js';
import { createWorkspaceGraph } from './util/create-workspace-graph.js';
import { ConfigurationError } from './util/errors.js';
import { isDirectory, isFile } from './util/fs.js';
import { _dirGlob, removeProductionSuffix } from './util/glob.js';
import { graphSequencer } from './util/graph-sequencer.js';
import mapWorkspaces from './util/map-workspaces.js';
import { join, relative } from './util/path.js';
import { normalizePluginConfig } from './util/plugin.js';
import { toRegexOrString } from './util/regex.js';
import { ELLIPSIS } from './util/string.js';
import { byPathDepth } from './util/workspace.js';
const defaultBaseFilenamePattern = '{index,cli,main}';
export const isDefaultPattern = (type, id) => {
    if (type === 'project')
        return id.startsWith('**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts');
    return (id.startsWith('{index,cli,main}.{js,mjs,cjs,jsx,ts,tsx,mts,cts') ||
        id.startsWith('src/{index,cli,main}.{js,mjs,cjs,jsx,ts,tsx,mts,cts'));
};
const getDefaultWorkspaceConfig = (extensions = []) => {
    const exts = [...DEFAULT_EXTENSIONS, ...extensions].map(ext => ext.slice(1)).join(',');
    return {
        entry: [`${defaultBaseFilenamePattern}.{${exts}}!`, `src/${defaultBaseFilenamePattern}.{${exts}}!`],
        project: [`**/*.{${exts}}!`],
    };
};
const isPluginName = (name) => pluginNames.includes(name);
const defaultConfig = {
    ignore: [],
    ignoreFiles: [],
    ignoreBinaries: [],
    ignoreDependencies: [],
    ignoreMembers: [],
    ignoreUnresolved: [],
    ignoreWorkspaces: [],
    ignoreExportsUsedInFile: false,
    isIncludeEntryExports: false,
    syncCompilers: new Map(),
    asyncCompilers: new Map(),
    rootPluginConfigs: {},
};
export class ConfigurationChief {
    cwd;
    rawConfig;
    isProduction;
    isStrict;
    isIncludeEntryExports;
    config;
    workspace;
    workspaces;
    ignoredWorkspacePatterns = [];
    workspacePackages = new Map();
    workspacesByPkgName = new Map();
    workspacesByName = new Map();
    additionalWorkspaceNames = new Set();
    availableWorkspaceNames = [];
    availableWorkspacePkgNames = new Set();
    availableWorkspaceDirs = [];
    workspaceGraph = new Map();
    includedWorkspaces = [];
    constructor(options) {
        this.cwd = options.cwd;
        this.isProduction = options.isProduction;
        this.isStrict = options.isStrict;
        this.isIncludeEntryExports = options.isIncludeEntryExports;
        this.workspace = options.workspace;
        this.workspaces = options.workspaces;
        this.rawConfig = options.parsedConfig;
        this.config = this.normalize(options.parsedConfig ?? {});
    }
    getConfigurationHints() {
        const hints = new Set();
        if (this.rawConfig) {
            if (this.workspacePackages.size > 1) {
                const entry = arrayify(this.rawConfig.entry);
                if (entry.length > 0) {
                    const identifier = `[${entry[0]}${entry.length > 1 ? `, ${ELLIPSIS}` : ''}]`;
                    hints.add({ type: 'entry-top-level', identifier });
                }
                const project = arrayify(this.rawConfig.project);
                if (project.length > 0) {
                    const identifier = `[${project[0]}${project.length > 1 ? `, ${ELLIPSIS}` : ''}]`;
                    hints.add({ type: 'project-top-level', identifier });
                }
            }
        }
        return hints;
    }
    normalize(rawConfig) {
        const ignore = arrayify(rawConfig.ignore ?? defaultConfig.ignore);
        const ignoreFiles = arrayify(rawConfig.ignoreFiles ?? defaultConfig.ignoreFiles);
        const ignoreBinaries = rawConfig.ignoreBinaries ?? [];
        const ignoreDependencies = rawConfig.ignoreDependencies ?? [];
        const ignoreMembers = rawConfig.ignoreMembers ?? [];
        const ignoreUnresolved = rawConfig.ignoreUnresolved ?? [];
        const ignoreExportsUsedInFile = rawConfig.ignoreExportsUsedInFile ?? false;
        const ignoreIssues = rawConfig.ignoreIssues;
        const ignoreWorkspaces = rawConfig.ignoreWorkspaces ?? defaultConfig.ignoreWorkspaces;
        const isIncludeEntryExports = rawConfig.includeEntryExports ?? this.isIncludeEntryExports;
        const { syncCompilers, asyncCompilers } = rawConfig;
        const rootPluginConfigs = {};
        for (const [pluginName, pluginConfig] of Object.entries(rawConfig)) {
            if (isPluginName(pluginName)) {
                rootPluginConfigs[pluginName] = normalizePluginConfig(pluginConfig);
            }
        }
        return {
            ignore,
            ignoreFiles,
            ignoreBinaries,
            ignoreDependencies,
            ignoreMembers,
            ignoreUnresolved,
            ignoreExportsUsedInFile,
            ignoreIssues,
            ignoreWorkspaces,
            isIncludeEntryExports,
            syncCompilers: new Map(Object.entries(syncCompilers ?? {})),
            asyncCompilers: new Map(Object.entries(asyncCompilers ?? {})),
            rootPluginConfigs,
        };
    }
    async getWorkspaces() {
        this.ignoredWorkspacePatterns = this.getIgnoredWorkspacePatterns();
        this.additionalWorkspaceNames = await this.getAdditionalWorkspaceNames();
        const workspaceNames = compact([...this.getListedWorkspaces(), ...this.additionalWorkspaceNames]);
        const [packages, wsPkgNames] = await mapWorkspaces(this.cwd, [...workspaceNames, '.']);
        this.workspacePackages = packages;
        this.availableWorkspaceNames = this.getAvailableWorkspaceNames(packages.keys());
        this.availableWorkspacePkgNames = wsPkgNames;
        this.availableWorkspaceDirs = this.availableWorkspaceNames
            .sort(byPathDepth)
            .reverse()
            .map(dir => join(this.cwd, dir));
        this.workspaceGraph = createWorkspaceGraph(this.cwd, this.availableWorkspaceNames, wsPkgNames, packages);
        this.includedWorkspaces = this.getIncludedWorkspaces();
        for (const workspace of this.includedWorkspaces) {
            this.workspacesByPkgName.set(workspace.pkgName, workspace);
            this.workspacesByName.set(workspace.name, workspace);
        }
        const sorted = graphSequencer(this.workspaceGraph, this.includedWorkspaces.map(workspace => workspace.dir));
        const [root, rest] = partition(sorted.chunks.flat(), dir => dir === this.cwd);
        return [...root, ...rest.reverse()].map(dir => this.includedWorkspaces.find(w => w.dir === dir));
    }
    getListedWorkspaces() {
        return this.workspaces.map(pattern => pattern.replace(/(?<=!?)\.\//, ''));
    }
    getIgnoredWorkspaces() {
        const ignoreWorkspaces = this.config.ignoreWorkspaces;
        if (this.isProduction)
            return ignoreWorkspaces.map(removeProductionSuffix);
        return ignoreWorkspaces.filter(pattern => !pattern.endsWith('!'));
    }
    getIgnoredWorkspacePatterns() {
        const ignoredWorkspacesManifest = this.getListedWorkspaces()
            .filter(name => name.startsWith('!'))
            .map(name => name.replace(/^!/, ''));
        return [...ignoredWorkspacesManifest, ...this.getIgnoredWorkspaces()];
    }
    getConfiguredWorkspaceKeys() {
        const initialWorkspaces = this.rawConfig?.workspaces
            ? Object.keys(this.rawConfig.workspaces)
            : [ROOT_WORKSPACE_NAME];
        const ignoreWorkspaces = this.getIgnoredWorkspaces();
        return initialWorkspaces.filter(workspaceName => !ignoreWorkspaces.includes(workspaceName));
    }
    async getAdditionalWorkspaceNames() {
        const workspaceKeys = this.getConfiguredWorkspaceKeys();
        const patterns = workspaceKeys.filter(key => key.includes('*'));
        const dirs = workspaceKeys.filter(key => !key.includes('*'));
        const globbedDirs = await _dirGlob({ patterns, cwd: this.cwd });
        return new Set([...dirs, ...globbedDirs].filter(name => name !== ROOT_WORKSPACE_NAME &&
            !this.workspacePackages.has(name) &&
            !picomatch.isMatch(name, this.ignoredWorkspacePatterns)));
    }
    getAvailableWorkspaceNames(names) {
        const availableWorkspaceNames = [];
        for (const name of names) {
            if (!picomatch.isMatch(name, this.ignoredWorkspacePatterns))
                availableWorkspaceNames.push(name);
        }
        return availableWorkspaceNames;
    }
    getIncludedWorkspaces() {
        if (this.workspace) {
            const dir = path.resolve(this.cwd, this.workspace);
            if (!isDirectory(dir))
                throw new ConfigurationError('Workspace is not a directory');
            if (!isFile(join(dir, 'package.json')))
                throw new ConfigurationError('Unable to find package.json in workspace');
        }
        const getAncestors = (name) => (ancestors, ancestorName) => {
            if (name === ancestorName)
                return ancestors;
            if (ancestorName === ROOT_WORKSPACE_NAME || name.startsWith(`${ancestorName}/`))
                ancestors.push(ancestorName);
            return ancestors;
        };
        const workspaceNames = this.workspace
            ? [...this.availableWorkspaceNames.reduce(getAncestors(this.workspace), []), this.workspace]
            : this.availableWorkspaceNames;
        const ws = new Set();
        if (this.workspace && this.isStrict) {
            ws.add(this.workspace);
        }
        else if (this.workspace) {
            const graph = this.workspaceGraph;
            if (graph) {
                const seen = new Set();
                const initialWorkspaces = workspaceNames.map(name => join(this.cwd, name));
                const workspaceDirsWithDependents = new Set(initialWorkspaces);
                const addDependents = (dir) => {
                    seen.add(dir);
                    const dirs = graph.get(dir);
                    if (!dirs || dirs.size === 0)
                        return;
                    if (initialWorkspaces.some(dir => dirs.has(dir)))
                        workspaceDirsWithDependents.add(dir);
                    for (const dir of dirs)
                        if (!seen.has(dir))
                            addDependents(dir);
                };
                this.availableWorkspaceDirs.forEach(addDependents);
                for (const dir of workspaceDirsWithDependents)
                    ws.add(relative(this.cwd, dir) || ROOT_WORKSPACE_NAME);
            }
        }
        else {
            for (const name of workspaceNames)
                ws.add(name);
        }
        return Array.from(ws)
            .sort(byPathDepth)
            .map((name) => {
            const dir = join(this.cwd, name);
            const pkg = this.workspacePackages.get(name);
            const pkgName = pkg?.pkgName ?? `KNIP_ADDED_${name}`;
            const manifestPath = pkg?.manifestPath ?? join(dir, 'package.json');
            const manifestStr = pkg?.manifestStr ?? '';
            const workspaceConfig = this.getWorkspaceConfig(name);
            const ignoreMembers = workspaceConfig.ignoreMembers?.map(toRegexOrString) ?? [];
            return {
                name,
                pkgName,
                dir,
                config: this.getConfigForWorkspace(name),
                ancestors: this.availableWorkspaceNames.reduce(getAncestors(name), []),
                manifestPath,
                manifestStr,
                ignoreMembers,
            };
        });
    }
    getManifestForWorkspace(name) {
        return this.workspacePackages.get(name)?.manifest;
    }
    getDescendentWorkspaces(name) {
        return this.availableWorkspaceNames
            .filter(workspaceName => workspaceName !== name)
            .filter(workspaceName => name === ROOT_WORKSPACE_NAME || workspaceName.startsWith(`${name}/`));
    }
    getIgnoredWorkspacesFor(name) {
        return this.ignoredWorkspacePatterns
            .filter(workspaceName => workspaceName !== name)
            .filter(workspaceName => name === ROOT_WORKSPACE_NAME || workspaceName.startsWith(name));
    }
    getNegatedWorkspacePatterns(name) {
        const descendentWorkspaces = this.getDescendentWorkspaces(name);
        const matchName = new RegExp(`^${name}/`);
        const ignoredWorkspaces = this.getIgnoredWorkspacesFor(name);
        const endMatch = /\/\*{1,2}$|\/$|$/;
        return [...ignoredWorkspaces, ...descendentWorkspaces]
            .map(workspaceName => workspaceName.replace(matchName, ''))
            .map(workspaceName => `!${workspaceName.replace(endMatch, '/**')}`);
    }
    getConfigKeyForWorkspace(workspaceName) {
        return this.getConfiguredWorkspaceKeys()
            .sort(byPathDepth)
            .reverse()
            .find(pattern => picomatch.isMatch(workspaceName, pattern));
    }
    getWorkspaceConfig(workspaceName) {
        const key = this.getConfigKeyForWorkspace(workspaceName);
        const workspaces = this.rawConfig?.workspaces ?? {};
        return ((key
            ? key === ROOT_WORKSPACE_NAME && !(ROOT_WORKSPACE_NAME in workspaces)
                ? this.rawConfig
                : workspaces[key]
            : {}) ?? {});
    }
    getIgnores(workspaceName) {
        const workspaceConfig = this.getWorkspaceConfig(workspaceName);
        const ignoreBinaries = workspaceConfig.ignoreBinaries ?? [];
        const ignoreDependencies = workspaceConfig.ignoreDependencies ?? [];
        const ignoreUnresolved = workspaceConfig.ignoreUnresolved ?? [];
        if (workspaceName === ROOT_WORKSPACE_NAME) {
            const { ignoreBinaries: rootIgnoreBinaries, ignoreDependencies: rootIgnoreDependencies, ignoreUnresolved: rootIgnoreUnresolved, } = this.rawConfig ?? {};
            return {
                ignoreBinaries: compact([...ignoreBinaries, ...(rootIgnoreBinaries ?? [])]),
                ignoreDependencies: compact([...ignoreDependencies, ...(rootIgnoreDependencies ?? [])]),
                ignoreUnresolved: compact([...ignoreUnresolved, ...(rootIgnoreUnresolved ?? [])]),
            };
        }
        return { ignoreBinaries, ignoreDependencies, ignoreUnresolved };
    }
    getConfigForWorkspace(workspaceName, extensions) {
        const baseConfig = getDefaultWorkspaceConfig(extensions);
        const workspaceConfig = this.getWorkspaceConfig(workspaceName);
        const entry = workspaceConfig.entry ? arrayify(workspaceConfig.entry) : baseConfig.entry;
        const project = workspaceConfig.project ? arrayify(workspaceConfig.project) : baseConfig.project;
        const paths = workspaceConfig.paths ?? {};
        const ignore = arrayify(workspaceConfig.ignore);
        const ignoreFiles = arrayify(workspaceConfig.ignoreFiles);
        const isIncludeEntryExports = workspaceConfig.includeEntryExports ?? this.config.isIncludeEntryExports;
        const plugins = {};
        for (const [pluginName, pluginConfig] of Object.entries(this.config.rootPluginConfigs)) {
            if (typeof pluginConfig !== 'undefined')
                plugins[pluginName] = pluginConfig;
        }
        for (const [pluginName, pluginConfig] of Object.entries(workspaceConfig)) {
            if (isPluginName(pluginName)) {
                plugins[pluginName] = normalizePluginConfig(pluginConfig);
            }
        }
        return { entry, project, paths, ignore, ignoreFiles, isIncludeEntryExports, ...plugins };
    }
    findWorkspaceByFilePath(filePath) {
        const workspaceDir = this.availableWorkspaceDirs.find(workspaceDir => filePath.startsWith(`${workspaceDir}/`));
        return this.includedWorkspaces.find(workspace => workspace.dir === workspaceDir);
    }
    getUnusedIgnoredWorkspaces() {
        const ignoredWorkspaceNames = this.config.ignoreWorkspaces.map(removeProductionSuffix);
        const workspaceNames = [...this.workspacePackages.keys(), ...this.additionalWorkspaceNames];
        return ignoredWorkspaceNames
            .filter(ignoredWorkspaceName => !workspaceNames.some(name => picomatch.isMatch(name, ignoredWorkspaceName)))
            .filter(ignoredWorkspaceName => {
            const dir = join(this.cwd, ignoredWorkspaceName);
            return !isDirectory(dir) || isFile(join(dir, 'package.json'));
        });
    }
}
