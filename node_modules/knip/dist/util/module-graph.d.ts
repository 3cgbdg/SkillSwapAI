import type { FileNode, IdToFileMap, IdToNsToFileMap, ImportDetails, ImportMap, ModuleGraph } from '../types/module-graph.js';
export declare const getOrCreateFileNode: (graph: ModuleGraph, filePath: string) => FileNode;
export declare const updateImportMap: (file: FileNode, importMap: ImportMap, graph: ModuleGraph) => void;
export declare const createImports: () => ImportDetails;
export declare const addValue: (map: IdToFileMap, id: string, value: string) => void;
export declare const addNsValue: (map: IdToNsToFileMap, id: string, ns: string, value: string) => void;
