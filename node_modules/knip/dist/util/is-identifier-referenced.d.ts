import type { ModuleGraph } from '../types/module-graph.js';
import { type TraceNode } from './trace.js';
type Result = {
    isReferenced: boolean;
    reExportingEntryFile: undefined | string;
    traceNode: TraceNode;
};
export declare const getIsIdentifierReferencedHandler: (graph: ModuleGraph, entryPaths: Set<string>, isTrace: boolean) => (filePath: string, id: string, isIncludeEntryExports?: boolean, traceNode?: TraceNode, seen?: Set<string>) => Result;
export {};
