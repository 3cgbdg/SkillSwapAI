import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { TsdownConfig } from './types.js';
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    resolveConfig: ResolveConfig<TsdownConfig>;
    args: {
        config: boolean;
    };
};
export default _default;
