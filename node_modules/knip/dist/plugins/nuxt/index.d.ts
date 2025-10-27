import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { NuxtConfig } from './types.js';
export declare const docs: {
    note: string;
};
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    production: string[];
    setup: () => Promise<void>;
    resolveConfig: ResolveConfig<NuxtConfig>;
};
export default _default;
