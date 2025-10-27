import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { JestConfig } from './types.js';
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    entry: string[];
    resolveConfig: ResolveConfig<JestConfig>;
    args: {
        config: boolean;
    };
};
export default _default;
