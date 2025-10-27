const title = 'ts-node';
const args = {
    positional: true,
    nodeImportArgs: true,
    boolean: ['transpileOnly', 'compilerHost', 'ignoreDiagnostics', 'swc', 'preferTsExts'],
    alias: { transpileOnly: ['T'], compilerHost: ['H'], ignoreDiagnostics: ['D'] },
};
export default {
    title,
    args,
};
