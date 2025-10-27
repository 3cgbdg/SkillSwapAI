import ts from 'typescript';
import { FIX_FLAGS, SYMBOL_TYPE } from '../constants.js';
function isGetOrSetAccessorDeclaration(node) {
    return node.kind === ts.SyntaxKind.SetAccessor || node.kind === ts.SyntaxKind.GetAccessor;
}
function isPrivateMember(node) {
    return node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword) ?? false;
}
export function isDefaultImport(node) {
    return node.kind === ts.SyntaxKind.ImportDeclaration && !!node.importClause && !!node.importClause.name;
}
export function isAccessExpression(node) {
    return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
}
export function isImportCall(node) {
    return (node.kind === ts.SyntaxKind.CallExpression &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword);
}
export function isRequireCall(callExpression) {
    if (callExpression.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const { expression, arguments: args } = callExpression;
    if (expression.kind !== ts.SyntaxKind.Identifier || expression.escapedText !== 'require') {
        return false;
    }
    return args.length === 1;
}
export function isPropertyAccessCall(node, identifier) {
    return (ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.getText() === identifier);
}
export const getNodeType = (node) => {
    if (!node)
        return SYMBOL_TYPE.UNKNOWN;
    if (ts.isFunctionDeclaration(node))
        return SYMBOL_TYPE.FUNCTION;
    if (ts.isClassDeclaration(node))
        return SYMBOL_TYPE.CLASS;
    if (ts.isInterfaceDeclaration(node))
        return SYMBOL_TYPE.INTERFACE;
    if (ts.isTypeAliasDeclaration(node))
        return SYMBOL_TYPE.TYPE;
    if (ts.isEnumDeclaration(node))
        return SYMBOL_TYPE.ENUM;
    if (ts.isVariableDeclaration(node))
        return SYMBOL_TYPE.VARIABLE;
    return SYMBOL_TYPE.UNKNOWN;
};
export const isNonPrivatePropertyOrMethodDeclaration = (member) => (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member) || isGetOrSetAccessorDeclaration(member)) &&
    !isPrivateMember(member);
export const getClassMember = (member, isFixTypes) => ({
    node: member,
    identifier: member.name.getText(),
    pos: member.name.getStart() + (ts.isComputedPropertyName(member.name) ? 1 : 0),
    type: SYMBOL_TYPE.MEMBER,
    fix: isFixTypes ? [member.getStart(), member.getEnd(), FIX_FLAGS.NONE] : undefined,
});
export const getEnumMember = (member, isFixTypes) => ({
    node: member,
    identifier: stripQuotes(member.name.getText()),
    pos: member.name.getStart(),
    type: SYMBOL_TYPE.MEMBER,
    fix: isFixTypes
        ? [member.getStart(), member.getEnd(), FIX_FLAGS.OBJECT_BINDING | FIX_FLAGS.WITH_NEWLINE]
        : undefined,
});
export function stripQuotes(name) {
    const length = name.length;
    if (length >= 2 && name.charCodeAt(0) === name.charCodeAt(length - 1) && isQuoteOrBacktick(name.charCodeAt(0))) {
        return name.substring(1, length - 1);
    }
    return name;
}
var CharacterCodes;
(function (CharacterCodes) {
    CharacterCodes[CharacterCodes["backtick"] = 96] = "backtick";
    CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
    CharacterCodes[CharacterCodes["singleQuote"] = 39] = "singleQuote";
})(CharacterCodes || (CharacterCodes = {}));
function isQuoteOrBacktick(charCode) {
    return (charCode === CharacterCodes.singleQuote ||
        charCode === CharacterCodes.doubleQuote ||
        charCode === CharacterCodes.backtick);
}
export function findAncestor(node, callback) {
    node = node?.parent;
    while (node) {
        const result = callback(node);
        if (result === 'STOP') {
            return undefined;
        }
        if (result) {
            return node;
        }
        node = node.parent;
    }
    return undefined;
}
export function findDescendants(node, callback) {
    const results = [];
    if (!node)
        return results;
    function visit(node) {
        const result = callback(node);
        if (result === 'STOP') {
            return;
        }
        if (result) {
            results.push(node);
        }
        ts.forEachChild(node, visit);
    }
    visit(node);
    return results;
}
export const isDeclarationFileExtension = (extension) => extension === '.d.ts' || extension === '.d.mts' || extension === '.d.cts';
export const getJSDocTags = (node) => {
    const tags = new Set();
    let tagNodes = ts.getJSDocTags(node);
    if (ts.isExportSpecifier(node) || ts.isBindingElement(node)) {
        tagNodes = [...tagNodes, ...ts.getJSDocTags(node.parent.parent)];
    }
    else if (ts.isEnumMember(node) || ts.isClassElement(node)) {
        tagNodes = [...tagNodes, ...ts.getJSDocTags(node.parent)];
    }
    else if (ts.isCallExpression(node)) {
        tagNodes = [...tagNodes, ...ts.getJSDocTags(node.parent)];
    }
    for (const tagNode of tagNodes) {
        const match = tagNode.getText()?.match(/@\S+/);
        if (match)
            tags.add(match[0]);
    }
    return tags;
};
export const getLineAndCharacterOfPosition = (node, pos) => {
    const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(pos);
    return { line: line + 1, col: character + 1, pos };
};
const getMemberStringLiterals = (typeChecker, node) => {
    if (ts.isElementAccessExpression(node)) {
        if (ts.isStringLiteral(node.argumentExpression))
            return [node.argumentExpression.text];
        const type = typeChecker.getTypeAtLocation(node.argumentExpression);
        if (type.isUnion())
            return type.types.map(type => type.value);
    }
    if (ts.isPropertyAccessExpression(node)) {
        return [node.name.getText()];
    }
};
export const getAccessMembers = (typeChecker, node) => {
    let members = [];
    let current = node.parent;
    while (current) {
        const ms = getMemberStringLiterals(typeChecker, current);
        if (!ms)
            break;
        const joinIds = (id) => (members.length === 0 ? id : members.map(ns => `${ns}.${id}`));
        members = members.concat(ms.flatMap(joinIds));
        current = current.parent;
    }
    return members;
};
export const isDestructuring = (node) => node.parent &&
    ts.isVariableDeclaration(node.parent) &&
    ts.isVariableDeclarationList(node.parent.parent) &&
    ts.isObjectBindingPattern(node.parent.name);
export const getDestructuredNames = (name) => {
    const members = [];
    let hasSpread = false;
    for (const element of name.elements) {
        if (element.dotDotDotToken) {
            hasSpread = true;
            break;
        }
        members.push(element.name.getText());
    }
    return [members, hasSpread];
};
export const isConsiderReferencedNS = (node) => ts.isPropertyAssignment(node.parent) ||
    ts.isShorthandPropertyAssignment(node.parent) ||
    (ts.isCallExpression(node.parent) && node.parent.arguments.includes(node)) ||
    ts.isSpreadAssignment(node.parent) ||
    ts.isArrayLiteralExpression(node.parent) ||
    ts.isExportAssignment(node.parent) ||
    (ts.isVariableDeclaration(node.parent) && node.parent.initializer === node) ||
    ts.isTypeQueryNode(node.parent.parent);
const objectEnumerationMethods = new Set(['keys', 'entries', 'values', 'getOwnPropertyNames']);
export const isObjectEnumerationCallExpressionArgument = (node) => ts.isCallExpression(node.parent) &&
    node.parent.arguments.includes(node) &&
    ts.isPropertyAccessExpression(node.parent.expression) &&
    ts.isIdentifier(node.parent.expression.expression) &&
    node.parent.expression.expression.escapedText === 'Object' &&
    objectEnumerationMethods.has(String(node.parent.expression.name.escapedText));
export const isInForIteration = (node) => node.parent && (ts.isForInStatement(node.parent) || ts.isForOfStatement(node.parent));
export const isTopLevel = (node) => ts.isSourceFile(node.parent) || (node.parent && ts.isSourceFile(node.parent.parent));
export const getTypeRef = (node) => {
    if (!node.parent?.parent)
        return;
    return findAncestor(node, _node => ts.isTypeReferenceNode(_node));
};
export const isImportSpecifier = (node) => ts.isImportSpecifier(node.parent) ||
    ts.isImportEqualsDeclaration(node.parent) ||
    ts.isImportClause(node.parent) ||
    ts.isNamespaceImport(node.parent);
const isInExportedNode = (node) => {
    if (getExportKeywordNode(node))
        return true;
    return node.parent ? isInExportedNode(node.parent) : false;
};
export const isReferencedInExport = (node) => {
    if (ts.isTypeQueryNode(node.parent) && isInExportedNode(node.parent.parent))
        return true;
    if (ts.isTypeReferenceNode(node.parent) && isInExportedNode(node.parent.parent))
        return true;
    return false;
};
export const getExportKeywordNode = (node) => node.modifiers?.find(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
export const getDefaultKeywordNode = (node) => node.modifiers?.find(mod => mod.kind === ts.SyntaxKind.DefaultKeyword);
export const hasRequireCall = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require')
        return true;
    return node.getChildren().some(child => hasRequireCall(child));
};
export const isModuleExportsAccess = (node) => ts.isIdentifier(node.expression) && node.expression.escapedText === 'module' && node.name.escapedText === 'exports';
export const getImportMap = (sourceFile) => {
    const importMap = new Map();
    for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement)) {
            const importClause = statement.importClause;
            const importPath = stripQuotes(statement.moduleSpecifier.getText());
            if (importClause?.name)
                importMap.set(importClause.name.text, importPath);
            if (importClause?.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
                for (const element of importClause.namedBindings.elements)
                    importMap.set(element.name.text, importPath);
            }
        }
    }
    return importMap;
};
export const getDefaultImportName = (importMap, specifier) => {
    for (const [importName, importSpecifier] of importMap) {
        if (importSpecifier === specifier)
            return importName;
    }
};
export const getPropertyValues = (node, propertyName) => {
    const values = new Set();
    if (ts.isObjectLiteralExpression(node)) {
        const props = node.properties.find(prop => ts.isPropertyAssignment(prop) && prop.name.getText() === propertyName);
        if (props && ts.isPropertyAssignment(props)) {
            const initializer = props.initializer;
            if (ts.isStringLiteral(initializer)) {
                values.add(initializer.text);
            }
            else if (ts.isArrayLiteralExpression(initializer)) {
                for (const element of initializer.elements) {
                    if (ts.isStringLiteral(element))
                        values.add(element.text);
                }
            }
            else if (ts.isObjectLiteralExpression(initializer)) {
                for (const prop of initializer.properties) {
                    if (ts.isPropertyAssignment(prop)) {
                        if (ts.isStringLiteral(prop.initializer))
                            values.add(prop.initializer.text);
                    }
                }
            }
        }
    }
    return values;
};
export const getAccessedIdentifiers = (identifier, scope) => {
    const identifiers = [];
    function visit(node) {
        if (ts.isPropertyAccessExpression(node) && node.expression.getText() === identifier) {
            identifiers.push({ identifier: String(node.name.escapedText), pos: node.name.pos });
        }
        else if (ts.isElementAccessExpression(node) &&
            node.expression.getText() === identifier &&
            ts.isStringLiteral(node.argumentExpression)) {
            identifiers.push({
                identifier: stripQuotes(node.argumentExpression.text),
                pos: node.argumentExpression.pos,
            });
        }
        else if (ts.isVariableDeclaration(node) &&
            node.initializer?.getText() === identifier &&
            ts.isObjectBindingPattern(node.name)) {
            for (const element of node.name.elements) {
                if (ts.isBindingElement(element)) {
                    const identifier = (element.propertyName ?? element.name).getText();
                    identifiers.push({ identifier, pos: element.pos });
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(scope);
    return identifiers;
};
