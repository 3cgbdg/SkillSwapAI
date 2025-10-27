import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { PlaywrightTestConfig } from './types.js';
export declare const entry: string[];
export declare const resolveConfig: ResolveConfig<PlaywrightTestConfig>;
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    entry: string[];
    resolveConfig: ResolveConfig<PlaywrightTestConfig>;
    args: {
        positional: boolean;
        args: (args: string[]) => string[];
        config: boolean;
    };
};
export default _default;
