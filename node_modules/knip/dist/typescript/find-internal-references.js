import ts from 'typescript';
import { isIdChar } from '../util/regex.js';
export const isType = (item) => item.type === 'type' || item.type === 'interface' || item.type === 'enum';
const findInFlow = (flowNode, targetSymbol) => {
    if (!flowNode?.node)
        return false;
    if (flowNode.node.symbol === targetSymbol)
        return true;
    return findInFlow(flowNode.antecedent, targetSymbol);
};
export const findInternalReferences = (item, sourceFile, typeChecker, referencedSymbolsInExport, isBindingElement) => {
    if (!item.symbol)
        return [0, false];
    if (item.identifier === '')
        return [1, false];
    if (item.symbol.flags & ts.SymbolFlags.AliasExcludes)
        return [1, false];
    const text = sourceFile.text;
    const id = item.identifier;
    const symbols = new Set();
    let refCount = 0;
    let isSymbolInExport = false;
    let index = 0;
    while (index < text.length && (index = text.indexOf(id, index)) !== -1) {
        if (!isIdChar(text.charAt(index - 1)) && !isIdChar(text.charAt(index + id.length))) {
            const isExportDeclaration = index === item.pos || index === item.pos + 1;
            if (!isExportDeclaration) {
                const symbol = typeChecker.getSymbolAtLocation(ts.getTokenAtPosition(sourceFile, index));
                if (symbol && id === symbol.escapedName) {
                    const isInExport = referencedSymbolsInExport.has(symbol);
                    if (isInExport)
                        isSymbolInExport = true;
                    if (item.symbol === symbol) {
                        refCount++;
                        if (isBindingElement)
                            return [refCount, true];
                    }
                    const declaration = symbol.declarations?.[0];
                    if (declaration) {
                        if (findInFlow(declaration.name?.flowNode, item.symbol)) {
                            refCount++;
                            return [refCount, isSymbolInExport];
                        }
                        if (ts.isImportSpecifier(declaration) && symbols.has(symbol)) {
                            return [++refCount, isSymbolInExport];
                        }
                    }
                    if (symbol && symbol.flags & ts.SymbolFlags.Property) {
                        const type = typeChecker.getTypeOfSymbol(symbol);
                        if (type?.symbol && item.symbol === type.symbol) {
                            refCount++;
                            if (isBindingElement)
                                return [refCount, isSymbolInExport];
                        }
                    }
                    symbols.add(symbol);
                }
            }
        }
        index += id.length;
    }
    return [refCount, isSymbolInExport];
};
