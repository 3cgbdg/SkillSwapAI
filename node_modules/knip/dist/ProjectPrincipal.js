import ts from 'typescript';
import { CacheConsultant } from './CacheConsultant.js';
import { getCompilerExtensions } from './compilers/index.js';
import { ANONYMOUS, DEFAULT_EXTENSIONS, PUBLIC_TAG } from './constants.js';
import { createHosts } from './typescript/create-hosts.js';
import { _getImportsAndExports } from './typescript/get-imports-and-exports.js';
import { SourceFileManager } from './typescript/SourceFileManager.js';
import { compact } from './util/array.js';
import { timerify } from './util/Performance.js';
import { extname, isInNodeModules, toAbsolute } from './util/path.js';
const baseCompilerOptions = {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    declaration: false,
    declarationMap: false,
    esModuleInterop: true,
    inlineSourceMap: false,
    inlineSources: false,
    jsx: ts.JsxEmit.Preserve,
    jsxImportSource: undefined,
    lib: [],
    noEmit: true,
    skipDefaultLibCheck: true,
    skipLibCheck: true,
    sourceMap: false,
    types: ['node'],
};
const tsCreateProgram = timerify(ts.createProgram);
export class ProjectPrincipal {
    entryPaths = new Set();
    projectPaths = new Set();
    nonEntryPaths = new Set();
    skipExportsAnalysis = new Set();
    cwd;
    compilerOptions;
    extensions;
    syncCompilers;
    asyncCompilers;
    isSkipLibs;
    isWatch;
    cache;
    toSourceFilePath;
    backend;
    findReferences;
    getImplementationAtPosition;
    constructor(options, { compilerOptions, compilers, pkgName, toSourceFilePath }) {
        this.compilerOptions = {
            ...compilerOptions,
            ...baseCompilerOptions,
            types: compact([...(compilerOptions.types ?? []), ...(baseCompilerOptions.types ?? [])]),
            allowNonTsExtensions: true,
        };
        const [syncCompilers, asyncCompilers] = compilers;
        this.extensions = new Set([...DEFAULT_EXTENSIONS, ...getCompilerExtensions(compilers)]);
        this.syncCompilers = syncCompilers;
        this.asyncCompilers = asyncCompilers;
        this.cwd = options.cwd;
        this.isSkipLibs = options.isSkipLibs;
        this.isWatch = options.isWatch;
        this.cache = new CacheConsultant(pkgName || ANONYMOUS, options);
        this.toSourceFilePath = toSourceFilePath;
        this.backend = {
            fileManager: new SourceFileManager({ compilers, isSkipLibs: options.isSkipLibs }),
        };
    }
    init() {
        const { compilerHost, resolveModuleNames, languageServiceHost } = createHosts({
            cwd: this.cwd,
            compilerOptions: this.compilerOptions,
            entryPaths: this.entryPaths,
            compilers: [this.syncCompilers, this.asyncCompilers],
            isSkipLibs: this.isSkipLibs,
            toSourceFilePath: this.toSourceFilePath,
            useResolverCache: !this.isWatch,
            fileManager: this.backend.fileManager,
        });
        this.backend.compilerHost = compilerHost;
        this.backend.resolveModuleNames = resolveModuleNames;
        this.backend.languageServiceHost = languageServiceHost;
    }
    addPaths(paths, basePath) {
        if (!paths)
            return;
        this.compilerOptions.paths ??= {};
        for (const key in paths) {
            const prefixes = paths[key].map(prefix => toAbsolute(prefix, basePath));
            if (key in this.compilerOptions.paths) {
                this.compilerOptions.paths[key] = compact([...this.compilerOptions.paths[key], ...prefixes]);
            }
            else {
                this.compilerOptions.paths[key] = prefixes;
            }
        }
    }
    addCompilers(compilers) {
        this.syncCompilers = new Map([...this.syncCompilers, ...compilers[0]]);
        this.asyncCompilers = new Map([...this.asyncCompilers, ...compilers[1]]);
        this.extensions = new Set([...this.extensions, ...getCompilerExtensions(compilers)]);
    }
    createProgram() {
        this.backend.program = tsCreateProgram([...this.entryPaths, ...this.nonEntryPaths], this.compilerOptions, this.backend.compilerHost, this.backend.program);
        const typeChecker = timerify(this.backend.program.getTypeChecker);
        this.backend.typeChecker = typeChecker();
    }
    hasAcceptedExtension(filePath) {
        return this.extensions.has(extname(filePath));
    }
    addEntryPath(filePath, options) {
        if (!isInNodeModules(filePath) && this.hasAcceptedExtension(filePath)) {
            this.entryPaths.add(filePath);
            this.projectPaths.add(filePath);
            if (options?.skipExportsAnalysis)
                this.skipExportsAnalysis.add(filePath);
        }
    }
    addEntryPaths(filePaths, options) {
        for (const filePath of filePaths)
            this.addEntryPath(filePath, options);
    }
    addNonEntryPath(filePath) {
        if (!isInNodeModules(filePath) && this.hasAcceptedExtension(filePath)) {
            this.nonEntryPaths.add(filePath);
        }
    }
    addProjectPath(filePath) {
        if (!isInNodeModules(filePath) && this.hasAcceptedExtension(filePath)) {
            this.projectPaths.add(filePath);
            this.deletedFiles.delete(filePath);
        }
    }
    deletedFiles = new Set();
    removeProjectPath(filePath) {
        this.entryPaths.delete(filePath);
        this.projectPaths.delete(filePath);
        this.invalidateFile(filePath);
        this.deletedFiles.add(filePath);
    }
    async runAsyncCompilers() {
        const add = timerify(this.backend.fileManager.compileAndAddSourceFile.bind(this.backend.fileManager));
        const extensions = Array.from(this.asyncCompilers.keys());
        const files = Array.from(this.projectPaths).filter(filePath => extensions.includes(extname(filePath)));
        for (const filePath of files) {
            await add(filePath);
        }
    }
    getUsedResolvedFiles() {
        this.createProgram();
        const sourceFiles = this.getProgramSourceFiles();
        return Array.from(this.projectPaths).filter(filePath => sourceFiles.has(filePath));
    }
    getProgramSourceFiles() {
        const programSourceFiles = this.backend.program?.getSourceFiles().map(sourceFile => sourceFile.fileName);
        return new Set(programSourceFiles);
    }
    getUnreferencedFiles() {
        const sourceFiles = this.getProgramSourceFiles();
        return Array.from(this.projectPaths).filter(filePath => !sourceFiles.has(filePath));
    }
    analyzeSourceFile(filePath, options, ignoreExportsUsedInFile) {
        const fd = this.cache.getFileDescriptor(filePath);
        if (!fd.changed && fd.meta?.data)
            return fd.meta.data;
        const typeChecker = this.backend.typeChecker;
        if (!typeChecker)
            throw new Error('TypeChecker must be initialized before source file analysis');
        const sourceFile = this.backend.fileManager.getSourceFile(filePath);
        if (!sourceFile)
            throw new Error(`Unable to find ${filePath}`);
        const skipExports = this.skipExportsAnalysis.has(filePath);
        const resolve = (specifier) => this.backend.resolveModuleNames([specifier], sourceFile.fileName)[0];
        return _getImportsAndExports(sourceFile, resolve, typeChecker, options, ignoreExportsUsedInFile, skipExports);
    }
    invalidateFile(filePath) {
        this.backend.fileManager.snapshotCache.delete(filePath);
        this.backend.fileManager.sourceFileCache.delete(filePath);
    }
    findUnusedMembers(filePath, members) {
        if (!this.findReferences || !this.getImplementationAtPosition) {
            const languageService = ts.createLanguageService(this.backend.languageServiceHost, ts.createDocumentRegistry());
            this.findReferences = timerify(languageService.findReferences);
            this.getImplementationAtPosition = timerify(languageService.getImplementationAtPosition);
        }
        return members.filter(member => {
            if (member.jsDocTags.has(PUBLIC_TAG))
                return false;
            const implementations = this.getImplementationAtPosition?.(filePath, member.pos)?.filter(impl => impl.fileName !== filePath || impl.textSpan.start !== member.pos) ?? [];
            const referencedSymbols = this.findReferences?.(filePath, member.pos)?.filter(sym => !implementations.some(impl => impl.fileName === sym.definition.fileName &&
                impl.textSpan.start === sym.definition.textSpan.start &&
                impl.textSpan.length === sym.definition.textSpan.length)) ?? [];
            const refs = referencedSymbols.flatMap(refs => refs.references).filter(ref => !ref.isDefinition);
            return refs.length === 0;
        });
    }
    hasExternalReferences(filePath, exportedItem) {
        if (exportedItem.jsDocTags.has(PUBLIC_TAG))
            return false;
        if (!this.findReferences || !this.getImplementationAtPosition) {
            const languageService = ts.createLanguageService(this.backend.languageServiceHost, ts.createDocumentRegistry());
            this.findReferences = timerify(languageService.findReferences);
            this.getImplementationAtPosition = timerify(languageService.getImplementationAtPosition);
        }
        const referencedSymbols = this.findReferences(filePath, exportedItem.pos);
        if (!referencedSymbols?.length)
            return false;
        const externalRefs = referencedSymbols
            .flatMap(refs => refs.references)
            .filter(ref => !ref.isDefinition && ref.fileName !== filePath)
            .filter(ref => {
            const sourceFile = this.backend.program?.getSourceFile(ref.fileName);
            if (!sourceFile)
                return true;
            const node = ts.getTokenAtPosition(sourceFile, ref.textSpan.start);
            if (!node?.parent?.parent?.parent)
                return true;
            return !(ts.isExportSpecifier(node.parent) && node.parent.parent.parent.moduleSpecifier);
        });
        return externalRefs.length > 0;
    }
    reconcileCache(graph) {
        for (const [filePath, file] of graph.entries()) {
            const fd = this.cache.getFileDescriptor(filePath);
            if (!fd?.meta)
                continue;
            const { imported, internalImportCache, ...clone } = file;
            fd.meta.data = clone;
        }
        this.cache.reconcile();
    }
}
