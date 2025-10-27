import { debugLog } from './debug.js';
import { isFile } from './fs.js';
import { updateImportMap } from './module-graph.js';
import { join, toAbsolute, toRelative } from './path.js';
export const getWatchHandler = async (options, { analyzedFiles, analyzeSourceFile, chief, collector, analyze, factory, graph, isIgnored, onUpdate, unreferencedFiles, }) => {
    const getIssues = () => collector.getIssues().issues;
    const processBatch = async (changes) => {
        const startTime = performance.now();
        const added = new Set();
        const deleted = new Set();
        const modified = new Set();
        for (const [type, _path] of changes) {
            const filePath = toAbsolute(_path, options.cwd);
            const relativePath = toRelative(_path, options.cwd);
            if (isIgnored(filePath)) {
                debugLog('*', `ignoring ${type} ${relativePath}`);
                continue;
            }
            const workspace = chief.findWorkspaceByFilePath(filePath);
            if (!workspace)
                continue;
            const principal = factory.getPrincipalByPackageName(workspace.pkgName);
            if (!principal)
                continue;
            switch (type) {
                case 'added':
                    added.add(filePath);
                    principal.addProjectPath(filePath);
                    principal.deletedFiles.delete(filePath);
                    debugLog(workspace.name, `Watcher: + ${relativePath}`);
                    break;
                case 'deleted':
                    deleted.add(filePath);
                    analyzedFiles.delete(filePath);
                    principal.removeProjectPath(filePath);
                    debugLog(workspace.name, `Watcher: - ${relativePath}`);
                    break;
                case 'modified':
                    modified.add(filePath);
                    debugLog(workspace.name, `Watcher: ± ${relativePath}`);
                    break;
            }
            principal.invalidateFile(filePath);
        }
        if (added.size === 0 && deleted.size === 0 && modified.size === 0)
            return;
        unreferencedFiles.clear();
        const cachedUnusedFiles = collector.purge();
        for (const filePath of added)
            cachedUnusedFiles.add(filePath);
        for (const filePath of deleted)
            cachedUnusedFiles.delete(filePath);
        const filePaths = factory.getPrincipals().flatMap(p => p.getUsedResolvedFiles());
        if (added.size > 0 || deleted.size > 0) {
            graph.clear();
            for (const filePath of filePaths) {
                const workspace = chief.findWorkspaceByFilePath(filePath);
                if (workspace) {
                    const principal = factory.getPrincipalByPackageName(workspace.pkgName);
                    if (principal)
                        analyzeSourceFile(filePath, principal);
                }
            }
        }
        else {
            for (const [filePath, file] of graph) {
                if (filePaths.includes(filePath)) {
                    file.imported = undefined;
                }
                else {
                    graph.delete(filePath);
                    analyzedFiles.delete(filePath);
                    const workspace = chief.findWorkspaceByFilePath(filePath);
                    if (workspace) {
                        const principal = factory.getPrincipalByPackageName(workspace.pkgName);
                        if (principal?.projectPaths.has(filePath))
                            cachedUnusedFiles.add(filePath);
                    }
                }
            }
            for (const filePath of filePaths) {
                if (!graph.has(filePath)) {
                    const workspace = chief.findWorkspaceByFilePath(filePath);
                    if (workspace) {
                        const principal = factory.getPrincipalByPackageName(workspace.pkgName);
                        if (principal)
                            analyzeSourceFile(filePath, principal);
                    }
                }
            }
            for (const filePath of modified) {
                if (!cachedUnusedFiles.has(filePath)) {
                    const workspace = chief.findWorkspaceByFilePath(filePath);
                    if (workspace) {
                        const principal = factory.getPrincipalByPackageName(workspace.pkgName);
                        if (principal)
                            analyzeSourceFile(filePath, principal);
                    }
                }
            }
            for (const filePath of filePaths) {
                const file = graph.get(filePath);
                if (file?.internalImportCache)
                    updateImportMap(file, file.internalImportCache, graph);
            }
        }
        await analyze();
        const unusedFiles = [...cachedUnusedFiles].filter(filePath => !analyzedFiles.has(filePath));
        collector.addFilesIssues(unusedFiles);
        collector.addFileCounts({ processed: analyzedFiles.size, unused: unusedFiles.length });
        for (const issue of collector.getRetainedIssues())
            collector.addIssue(issue);
        onUpdate({ issues: getIssues(), duration: performance.now() - startTime });
    };
    const listener = (eventType, filename) => {
        debugLog('*', `(raw) ${eventType} ${filename}`);
        if (typeof filename === 'string') {
            const event = eventType === 'rename' ? (isFile(join(options.cwd, filename)) ? 'added' : 'deleted') : 'modified';
            processBatch([[event, filename]]);
        }
    };
    onUpdate({ issues: getIssues() });
    return listener;
};
