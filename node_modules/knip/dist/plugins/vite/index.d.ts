import type { IsPluginEnabled, ResolveFromAST } from '../../types/config.js';
export declare const config: string[];
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    resolveConfig: import("../../types/config.js").ResolveConfig<import("../vitest/types.js").ViteConfigOrFn | import("../vitest/types.js").VitestWorkspaceConfig>;
    resolveFromAST: ResolveFromAST;
};
export default _default;
