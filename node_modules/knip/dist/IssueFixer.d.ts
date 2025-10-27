import type { Fix, Fixes } from './types/exports.js';
import type { Issues } from './types/issues.js';
import type { MainOptions } from './util/create-options.js';
export declare class IssueFixer {
    options: MainOptions;
    unusedTypeNodes: Map<string, Set<Fix>>;
    unusedExportNodes: Map<string, Set<Fix>>;
    constructor(options: MainOptions);
    addUnusedTypeNode(filePath: string, fixes: Fixes | undefined): void;
    addUnusedExportNode(filePath: string, fixes: Fixes | undefined): void;
    fixIssues(issues: Issues): Promise<Set<string>>;
    private markExportFixed;
    private removeUnusedFiles;
    private removeUnusedExports;
    private removeUnusedDependencies;
}
