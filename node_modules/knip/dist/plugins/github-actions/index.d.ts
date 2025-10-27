import type { IsPluginEnabled, PluginOptions, ResolveConfig } from '../../types/config.js';
export declare const getActionDependencies: (config: any, options: PluginOptions) => string[];
declare const _default: {
    title: string;
    enablers: string;
    isEnabled: IsPluginEnabled;
    isRootOnly: true;
    config: string[];
    resolveConfig: ResolveConfig;
};
export default _default;
