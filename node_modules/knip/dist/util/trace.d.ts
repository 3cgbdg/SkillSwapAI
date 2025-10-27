import type { ModuleGraph } from '../types/module-graph.js';
import type { MainOptions } from './create-options.js';
type CreateNodeOpts = {
    identifier?: string;
    hasRef?: boolean;
    isEntry?: boolean;
};
type Create = (filePath: string, options?: CreateNodeOpts) => TraceNode;
export type TraceNode = {
    filePath: string;
    identifier?: string;
    hasRef: boolean;
    isEntry: boolean;
    children: Set<TraceNode>;
};
export declare const printTrace: (node: TraceNode, filePath: string, options: MainOptions, identifier?: string) => void;
export declare const createNode: Create;
export declare const addNodes: (node: TraceNode, id: string, importedSymbols: ModuleGraph, filePaths?: Set<string>) => void;
export declare const createAndPrintTrace: (filePath: string, options: MainOptions, opts?: CreateNodeOpts) => void;
export {};
