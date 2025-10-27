import type { ImportDetails, ModuleGraph } from '../types/module-graph.js';
export declare const hasStrictlyEnumReferences: (importsForExport: ImportDetails | undefined, id: string) => boolean;
export declare const hasStrictlyNsReferences: (graph: ModuleGraph, importsForExport: ImportDetails | undefined, id: string) => [boolean, string?];
export declare const getType: (hasOnlyNsReference: boolean, isType: boolean) => "exports" | "nsExports" | "types" | "nsTypes";
