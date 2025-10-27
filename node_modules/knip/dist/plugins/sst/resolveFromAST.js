import ts from 'typescript';
import { getImportMap, getPropertyValues } from '../../typescript/ast-helpers.js';
import { toDeferResolveProductionEntry } from '../../util/input.js';
export const getInputsFromHandlers = (sourceFile, options) => {
    const { getSourceFile, getReferencedInternalFilePath } = options;
    const entries = new Set();
    const importMap = getImportMap(sourceFile);
    function addHandlerSpecifiers(node) {
        if (ts.isObjectLiteralExpression(node)) {
            const specifiers = getPropertyValues(node, 'handler');
            for (const specifier of specifiers)
                entries.add(specifier.substring(0, specifier.lastIndexOf('.')));
        }
        ts.forEachChild(node, addHandlerSpecifiers);
    }
    function visit(node) {
        if (ts.isCallExpression(node)) {
            if (ts.isPropertyAccessExpression(node.expression)) {
                if (node.expression.name.text === 'stack') {
                    const arg = node.arguments[0];
                    if (ts.isIdentifier(arg)) {
                        const importPath = importMap.get(arg.text);
                        if (importPath) {
                            const input = toDeferResolveProductionEntry(importPath, { containingFilePath: options.configFilePath });
                            const resolvedPath = getReferencedInternalFilePath(input);
                            if (resolvedPath) {
                                const stackFile = getSourceFile(resolvedPath);
                                if (stackFile)
                                    ts.forEachChild(stackFile, addHandlerSpecifiers);
                            }
                        }
                    }
                }
                if (node.expression.name.text === 'route' && node.arguments.length >= 2) {
                    const handlerArg = node.arguments[1];
                    if (ts.isStringLiteral(handlerArg)) {
                        entries.add(handlerArg.text);
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    ts.forEachChild(sourceFile, addHandlerSpecifiers);
    ts.forEachChild(sourceFile, visit);
    return Array.from(entries).map(specifier => toDeferResolveProductionEntry(specifier, { containingFilePath: options.configFilePath }));
};
