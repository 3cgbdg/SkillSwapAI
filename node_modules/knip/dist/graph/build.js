import { _getInputsFromScripts } from '../binaries/index.js';
import { getCompilerExtensions, getIncludedCompilers } from '../compilers/index.js';
import { DEFAULT_EXTENSIONS, FOREIGN_FILE_EXTENSIONS } from '../constants.js';
import { debugLog, debugLogArray } from '../util/debug.js';
import { getReferencedInputsHandler } from '../util/get-referenced-inputs.js';
import { _glob, _syncGlob, negate, prependDirToPattern } from '../util/glob.js';
import { isAlias, isConfig, isDeferResolveEntry, isDeferResolveProductionEntry, isEntry, isIgnore, isProductionEntry, isProject, toProductionEntry, } from '../util/input.js';
import { loadTSConfig } from '../util/load-tsconfig.js';
import { getOrCreateFileNode, updateImportMap } from '../util/module-graph.js';
import { getPackageNameFromModuleSpecifier, isStartsLikePackageName, sanitizeSpecifier } from '../util/modules.js';
import { perfObserver } from '../util/Performance.js';
import { getEntrySpecifiersFromManifest, getManifestImportDependencies } from '../util/package-json.js';
import { dirname, extname, isAbsolute, join, relative, toRelative } from '../util/path.js';
import { augmentWorkspace, getToSourcePathHandler, getToSourcePathsHandler } from '../util/to-source-path.js';
import { WorkspaceWorker } from '../WorkspaceWorker.js';
export async function build({ chief, collector, deputy, factory, isGitIgnored, streamer, workspaces, options, }) {
    const configFilesMap = new Map();
    const enabledPluginsStore = new Map();
    const toSourceFilePath = getToSourcePathHandler(chief);
    const toSourceFilePaths = getToSourcePathsHandler(chief);
    const addIssue = (issue) => collector.addIssue(issue) && options.isWatch && collector.retainIssue(issue);
    const getReferencedInternalFilePath = getReferencedInputsHandler(deputy, chief, isGitIgnored, addIssue);
    for (const workspace of workspaces) {
        const { name, dir, manifestPath, manifestStr } = workspace;
        const manifest = chief.getManifestForWorkspace(name);
        if (!manifest)
            continue;
        deputy.addWorkspace({
            name,
            cwd: options.cwd,
            dir,
            manifestPath,
            manifestStr,
            manifest,
            ...chief.getIgnores(name),
        });
    }
    collector.addIgnorePatterns(chief.config.ignore.map(p => join(options.cwd, p)));
    collector.addIgnoreFilesPatterns(chief.config.ignoreFiles.map(p => join(options.cwd, p)));
    for (const workspace of workspaces) {
        const { name, dir, ancestors, pkgName, manifestPath: filePath } = workspace;
        streamer.cast('Analyzing workspace', name);
        const manifest = chief.getManifestForWorkspace(name);
        if (!manifest)
            continue;
        const dependencies = deputy.getDependencies(name);
        const compilers = getIncludedCompilers(chief.config.syncCompilers, chief.config.asyncCompilers, dependencies);
        const extensions = getCompilerExtensions(compilers);
        const extensionGlobStr = `.{${[...DEFAULT_EXTENSIONS, ...extensions].map(ext => ext.slice(1)).join(',')}}`;
        const config = chief.getConfigForWorkspace(name, extensions);
        const tsConfigFilePath = join(dir, options.tsConfigFile ?? 'tsconfig.json');
        const { isFile, compilerOptions, definitionPaths } = await loadTSConfig(tsConfigFilePath);
        if (isFile)
            augmentWorkspace(workspace, dir, compilerOptions);
        const worker = new WorkspaceWorker({
            name,
            dir,
            config,
            manifest,
            dependencies,
            getReferencedInternalFilePath: (input) => getReferencedInternalFilePath(input, workspace),
            findWorkspaceByFilePath: chief.findWorkspaceByFilePath.bind(chief),
            negatedWorkspacePatterns: chief.getNegatedWorkspacePatterns(name),
            ignoredWorkspacePatterns: chief.getIgnoredWorkspacesFor(name),
            enabledPluginsInAncestors: ancestors.flatMap(ancestor => enabledPluginsStore.get(ancestor) ?? []),
            getSourceFile: (filePath) => principal.backend.fileManager.getSourceFile(filePath),
            configFilesMap,
            options,
        });
        await worker.init();
        const inputs = new Set();
        if (definitionPaths.length > 0) {
            debugLogArray(name, 'Definition paths', definitionPaths);
            for (const id of definitionPaths)
                inputs.add(toProductionEntry(id, { containingFilePath: tsConfigFilePath }));
        }
        const sharedGlobOptions = { cwd: options.cwd, dir, gitignore: options.gitignore };
        collector.addIgnorePatterns(config.ignore.map(p => join(options.cwd, prependDirToPattern(name, p))));
        collector.addIgnoreFilesPatterns(config.ignoreFiles.map(p => join(options.cwd, prependDirToPattern(name, p))));
        const entrySpecifiersFromManifest = getEntrySpecifiersFromManifest(manifest);
        const label = 'entry paths from package.json';
        for (const filePath of await toSourceFilePaths(entrySpecifiersFromManifest, dir, extensionGlobStr, label)) {
            inputs.add(toProductionEntry(filePath));
        }
        for (const identifier of entrySpecifiersFromManifest) {
            if (!identifier.startsWith('!') && !isGitIgnored(join(dir, identifier))) {
                const files = _syncGlob({ patterns: [identifier], cwd: dir });
                if (files.length === 0) {
                    collector.addConfigurationHint({ type: 'package-entry', filePath, identifier, workspaceName: name });
                }
            }
        }
        for (const dep of getManifestImportDependencies(manifest))
            deputy.addReferencedDependency(name, dep);
        const principal = factory.createPrincipal(options, {
            dir,
            isFile,
            compilerOptions,
            compilers,
            pkgName,
            toSourceFilePath,
        });
        principal.addPaths(config.paths, dir);
        const inputsFromPlugins = await worker.runPlugins();
        for (const id of inputsFromPlugins)
            inputs.add(Object.assign(id, { skipExportsAnalysis: !id.allowIncludeExports }));
        enabledPluginsStore.set(name, worker.enabledPlugins);
        const entryPatterns = new Set();
        const entryPatternsSkipExports = new Set();
        const productionPatterns = new Set();
        const productionPatternsSkipExports = new Set();
        const projectFilePatterns = new Set();
        for (const input of inputs) {
            const specifier = input.specifier;
            if (isEntry(input)) {
                const relativePath = isAbsolute(specifier) ? relative(dir, specifier) : specifier;
                if (!input.skipExportsAnalysis) {
                    entryPatterns.add(relativePath);
                }
                else {
                    entryPatternsSkipExports.add(relativePath);
                }
            }
            else if (isProductionEntry(input)) {
                const relativePath = isAbsolute(specifier) ? relative(dir, specifier) : specifier;
                if (!input.skipExportsAnalysis) {
                    productionPatterns.add(relativePath);
                }
                else {
                    productionPatternsSkipExports.add(relativePath);
                }
            }
            else if (isProject(input)) {
                projectFilePatterns.add(isAbsolute(specifier) ? relative(dir, specifier) : specifier);
            }
            else if (isAlias(input)) {
                principal.addPaths({ [input.specifier]: input.prefixes }, input.dir ?? dir);
            }
            else if (isIgnore(input)) {
                if (input.issueType === 'dependencies' || input.issueType === 'unlisted') {
                    deputy.addIgnoredDependencies(name, input.specifier);
                }
                else if (input.issueType === 'binaries') {
                    deputy.addIgnoredBinaries(name, input.specifier);
                }
            }
            else if (!isConfig(input)) {
                const ws = (input.containingFilePath && chief.findWorkspaceByFilePath(input.containingFilePath)) || workspace;
                const resolvedFilePath = getReferencedInternalFilePath(input, ws);
                if (resolvedFilePath) {
                    if (isDeferResolveProductionEntry(input)) {
                        productionPatternsSkipExports.add(resolvedFilePath);
                    }
                    else if (isDeferResolveEntry(input)) {
                        if (!options.isProduction || !input.optional)
                            entryPatternsSkipExports.add(resolvedFilePath);
                    }
                    else {
                        principal.addEntryPath(resolvedFilePath, { skipExportsAnalysis: true });
                    }
                }
            }
        }
        if (options.isProduction) {
            const negatedEntryPatterns = [...entryPatterns, ...entryPatternsSkipExports].map(negate);
            {
                const label = 'entry paths';
                const patterns = worker.getProductionEntryFilePatterns(negatedEntryPatterns);
                const workspaceEntryPaths = await _glob({ ...sharedGlobOptions, patterns, gitignore: false, label });
                principal.addEntryPaths(workspaceEntryPaths);
            }
            {
                const label = 'production entry paths from plugins (ignore exports)';
                const patterns = Array.from(productionPatternsSkipExports);
                const pluginWorkspaceEntryPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                principal.addEntryPaths(pluginWorkspaceEntryPaths, { skipExportsAnalysis: true });
            }
            {
                const label = 'production entry paths from plugins';
                const patterns = Array.from(productionPatterns);
                const pluginWorkspaceEntryPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                principal.addEntryPaths(pluginWorkspaceEntryPaths);
            }
            {
                const label = 'project paths';
                const patterns = worker.getProductionProjectFilePatterns(negatedEntryPatterns);
                const workspaceProjectPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                for (const projectPath of workspaceProjectPaths)
                    principal.addProjectPath(projectPath);
            }
        }
        else {
            {
                const label = 'entry paths from plugins (ignore exports)';
                const patterns = worker.getPluginEntryFilePatterns([
                    ...entryPatternsSkipExports,
                    ...productionPatternsSkipExports,
                ]);
                const pluginWorkspaceEntryPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                principal.addEntryPaths(pluginWorkspaceEntryPaths, { skipExportsAnalysis: true });
            }
            {
                const label = 'entry paths from plugins';
                const patterns = worker.getPluginEntryFilePatterns([...entryPatterns, ...productionPatterns]);
                const pluginWorkspaceEntryPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                principal.addEntryPaths(pluginWorkspaceEntryPaths);
            }
            {
                const label = 'entry paths';
                const patterns = worker.getEntryFilePatterns();
                const entryPaths = await _glob({ ...sharedGlobOptions, patterns, gitignore: false, label });
                const hints = worker.getConfigurationHints('entry', patterns, entryPaths, principal.entryPaths);
                for (const hint of hints)
                    collector.addConfigurationHint(hint);
                principal.addEntryPaths(entryPaths);
            }
            {
                const label = 'project paths from plugins';
                const patterns = worker.getPluginProjectFilePatterns();
                const pluginWorkspaceProjectPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                for (const projectPath of pluginWorkspaceProjectPaths)
                    principal.addProjectPath(projectPath);
            }
            {
                const label = 'plugin configuration paths (ignore exports)';
                const patterns = worker.getPluginConfigPatterns();
                const configurationEntryPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                principal.addEntryPaths(configurationEntryPaths, { skipExportsAnalysis: true });
            }
            {
                const label = 'project paths';
                const patterns = worker.getProjectFilePatterns([...productionPatternsSkipExports, ...projectFilePatterns]);
                const projectPaths = await _glob({ ...sharedGlobOptions, patterns, label });
                const hints = worker.getConfigurationHints('project', config.project, projectPaths, principal.projectPaths);
                for (const hint of hints)
                    collector.addConfigurationHint(hint);
                for (const projectPath of projectPaths)
                    principal.addProjectPath(projectPath);
            }
        }
        if (options.configFilePath) {
            factory.getPrincipals().at(0)?.addEntryPath(options.configFilePath, { skipExportsAnalysis: true });
        }
        worker.onDispose();
    }
    const principals = factory.getPrincipals();
    debugLog('*', `Created ${principals.length} programs for ${workspaces.length} workspaces`);
    const graph = new Map();
    const analyzedFiles = new Set();
    const unreferencedFiles = new Set();
    const entryPaths = new Set();
    const isInternalWorkspace = (packageName) => chief.availableWorkspacePkgNames.has(packageName);
    const getPrincipalByFilePath = (filePath) => {
        const workspace = chief.findWorkspaceByFilePath(filePath);
        if (workspace)
            return factory.getPrincipalByPackageName(workspace.pkgName);
    };
    const analyzeOpts = {
        isFixExports: options.isFixUnusedExports,
        isFixTypes: options.isFixUnusedTypes,
        isReportClassMembers: options.isReportClassMembers,
        skipTypeOnly: options.isStrict,
        tags: options.tags,
    };
    const analyzeSourceFile = (filePath, principal) => {
        if (!options.isWatch && analyzedFiles.has(filePath))
            return;
        analyzedFiles.add(filePath);
        const workspace = chief.findWorkspaceByFilePath(filePath);
        if (workspace) {
            const file = principal.analyzeSourceFile(filePath, analyzeOpts, chief.config.ignoreExportsUsedInFile);
            const unresolvedImports = new Set();
            for (const unresolvedImport of file.imports.unresolved) {
                const { specifier } = unresolvedImport;
                if (specifier.startsWith('http'))
                    continue;
                const sanitizedSpecifier = sanitizeSpecifier(specifier);
                if (isStartsLikePackageName(sanitizedSpecifier)) {
                    file.imports.external.add({ ...unresolvedImport, specifier: sanitizedSpecifier });
                }
                else {
                    const isIgnored = isGitIgnored(join(dirname(filePath), sanitizedSpecifier));
                    if (!isIgnored) {
                        const ext = extname(sanitizedSpecifier);
                        const hasIgnoredExtension = FOREIGN_FILE_EXTENSIONS.has(ext);
                        if (!ext || (ext !== '.json' && !hasIgnoredExtension))
                            unresolvedImports.add(unresolvedImport);
                    }
                }
            }
            for (const filePath of file.imports.resolved) {
                const isIgnored = isGitIgnored(filePath);
                if (!isIgnored)
                    principal.addEntryPath(filePath, { skipExportsAnalysis: true });
            }
            for (const [import_, specifierFilePath] of file.imports.specifiers) {
                const packageName = getPackageNameFromModuleSpecifier(import_.specifier);
                if (packageName && isInternalWorkspace(packageName)) {
                    file.imports.external.add({ ...import_, specifier: packageName });
                    const principal = getPrincipalByFilePath(specifierFilePath);
                    if (principal && !isGitIgnored(specifierFilePath)) {
                        principal.addNonEntryPath(specifierFilePath);
                    }
                }
            }
            if (file.scripts && file.scripts.size > 0) {
                const dependencies = deputy.getDependencies(workspace.name);
                const manifestScriptNames = new Set(Object.keys(chief.getManifestForWorkspace(workspace.name)?.scripts ?? {}));
                const dir = dirname(filePath);
                const opts = {
                    cwd: dir,
                    rootCwd: options.cwd,
                    containingFilePath: filePath,
                    dependencies,
                    manifestScriptNames,
                };
                const inputs = _getInputsFromScripts(file.scripts, opts);
                for (const input of inputs) {
                    input.containingFilePath ??= filePath;
                    input.dir ??= dir;
                    const specifierFilePath = getReferencedInternalFilePath(input, workspace);
                    if (specifierFilePath)
                        principal.addEntryPath(specifierFilePath, { skipExportsAnalysis: true });
                }
            }
            const node = getOrCreateFileNode(graph, filePath);
            file.imports.unresolved = unresolvedImports;
            Object.assign(node, file);
            updateImportMap(node, file.imports.internal, graph);
            node.internalImportCache = file.imports.internal;
            graph.set(filePath, node);
        }
    };
    for (let i = 0; i < principals.length; ++i) {
        const principal = principals[i];
        if (!principal)
            continue;
        principal.init();
        if (principal.asyncCompilers.size > 0) {
            streamer.cast('Running async compilers');
            await principal.runAsyncCompilers();
        }
        streamer.cast('Analyzing source files', toRelative(principal.cwd, options.cwd));
        let size = principal.entryPaths.size;
        let round = 0;
        do {
            size = principal.entryPaths.size;
            const resolvedFiles = principal.getUsedResolvedFiles();
            const files = resolvedFiles.filter(filePath => !analyzedFiles.has(filePath));
            debugLogArray('*', `Analyzing used resolved files [P${i + 1}/${++round}]`, files);
            for (const filePath of files)
                analyzeSourceFile(filePath, principal);
        } while (size !== principal.entryPaths.size);
        for (const filePath of principal.getUnreferencedFiles())
            unreferencedFiles.add(filePath);
        for (const filePath of principal.entryPaths)
            entryPaths.add(filePath);
        principal.reconcileCache(graph);
        if (options.isIsolateWorkspaces || (options.isSkipLibs && !options.isWatch)) {
            factory.deletePrincipal(principal, options.cwd);
            principals[i] = undefined;
        }
        perfObserver.addMemoryMark(factory.getPrincipalCount());
    }
    if (!options.isWatch && options.isSkipLibs && !options.isIsolateWorkspaces) {
        for (const principal of principals) {
            if (principal)
                factory.deletePrincipal(principal, options.cwd);
        }
        principals.length = 0;
    }
    return {
        graph,
        entryPaths,
        analyzedFiles,
        unreferencedFiles,
        analyzeSourceFile,
    };
}
