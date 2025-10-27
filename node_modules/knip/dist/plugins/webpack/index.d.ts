import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { WebpackConfig } from './types.js';
export declare const findWebpackDependenciesFromConfig: ResolveConfig<WebpackConfig>;
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    resolveConfig: ResolveConfig<WebpackConfig>;
    args: {
        binaries: string[];
        config: boolean;
    };
};
export default _default;
