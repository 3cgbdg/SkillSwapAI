import ts from 'typescript';
import type { GetImportsAndExportsOptions, IgnoreExportsUsedInFile } from '../types/config.js';
import type { FileNode } from '../types/module-graph.js';
import type { BoundSourceFile } from './SourceFile.js';
export declare const _getImportsAndExports: (sourceFile: BoundSourceFile, resolveModule: (specifier: string) => ts.ResolvedModuleFull | undefined, typeChecker: ts.TypeChecker, options: GetImportsAndExportsOptions, ignoreExportsUsedInFile: IgnoreExportsUsedInFile, skipExports: boolean) => FileNode;
