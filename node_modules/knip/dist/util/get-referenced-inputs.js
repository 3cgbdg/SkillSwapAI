import { IGNORED_RUNTIME_DEPENDENCIES } from '../constants.js';
import { debugLog } from './debug.js';
import { fromBinary, isBinary, isConfig, isDeferResolve, isDeferResolveEntry, isDependency, toDebugString, } from './input.js';
import { getPackageNameFromSpecifier } from './modules.js';
import { dirname, isAbsolute, isInternal, join } from './path.js';
import { _resolveSync } from './resolve.js';
const getWorkspaceFor = (input, chief, workspace) => (input.dir && chief.findWorkspaceByFilePath(`${input.dir}/`)) ||
    (input.containingFilePath && chief.findWorkspaceByFilePath(input.containingFilePath)) ||
    workspace;
export const getReferencedInputsHandler = (deputy, chief, isGitIgnored, addIssue) => (input, workspace) => {
    const { specifier, containingFilePath } = input;
    if (!containingFilePath || IGNORED_RUNTIME_DEPENDENCIES.has(specifier))
        return;
    if (isBinary(input)) {
        const binaryName = fromBinary(input);
        const inputWorkspace = getWorkspaceFor(input, chief, workspace);
        const isHandled = deputy.maybeAddReferencedBinary(inputWorkspace, binaryName);
        if (isHandled || input.optional)
            return;
        addIssue({
            type: 'binaries',
            filePath: containingFilePath,
            workspace: workspace.name,
            symbol: binaryName,
            specifier,
        });
        return;
    }
    const packageName = getPackageNameFromSpecifier(specifier);
    if (packageName && (isDependency(input) || isDeferResolve(input) || isConfig(input))) {
        const isWorkspace = chief.workspacesByPkgName.has(packageName);
        const inputWorkspace = getWorkspaceFor(input, chief, workspace);
        if (inputWorkspace) {
            const isHandled = deputy.maybeAddReferencedExternalDependency(inputWorkspace, packageName);
            if (isWorkspace || isDependency(input)) {
                if (!isHandled) {
                    if (!input.optional && ((deputy.isProduction && input.production) || !deputy.isProduction)) {
                        addIssue({
                            type: 'unlisted',
                            filePath: containingFilePath,
                            workspace: inputWorkspace.name,
                            symbol: packageName ?? specifier,
                            specifier,
                        });
                    }
                    return;
                }
                const ref = _resolveSync(specifier, dirname(containingFilePath));
                if (ref && isInternal(ref) && !isGitIgnored(ref))
                    return ref;
            }
            if (isHandled)
                return;
        }
    }
    if (isDeferResolve(input) && deputy.isProduction && !input.production) {
        return;
    }
    const baseDir = input.dir ?? dirname(containingFilePath);
    const filePath = isAbsolute(specifier) ? specifier : join(baseDir, specifier);
    const resolvedFilePath = _resolveSync(filePath, baseDir);
    if (resolvedFilePath && isInternal(resolvedFilePath)) {
        return isGitIgnored(resolvedFilePath) ? undefined : resolvedFilePath;
    }
    if (input.optional)
        return;
    if (!isInternal(filePath)) {
        addIssue({
            type: 'unlisted',
            filePath: containingFilePath,
            workspace: workspace.name,
            symbol: packageName ?? specifier,
            specifier,
        });
    }
    else if (!isGitIgnored(filePath)) {
        if (!isDeferResolveEntry(input) && !isConfig(input)) {
            addIssue({
                type: 'unresolved',
                filePath: containingFilePath,
                workspace: workspace.name,
                symbol: specifier,
            });
        }
        else {
            debugLog(workspace.name, `Unable to resolve ${toDebugString(input, chief.cwd)}`);
        }
    }
};
