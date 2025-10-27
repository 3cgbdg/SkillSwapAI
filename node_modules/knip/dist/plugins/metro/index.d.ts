import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { MetroConfig } from './types.js';
export declare const docs: {
    note: string;
};
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    production: string[];
    resolveConfig: ResolveConfig<MetroConfig>;
};
export default _default;
