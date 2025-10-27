import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { RelayConfig } from './types.js';
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    resolveConfig: ResolveConfig<RelayConfig>;
    args: {
        binaries: string[];
        args: (args: string[]) => string[];
        config: boolean;
    };
};
export default _default;
