import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { NetlifyConfig } from './types.js';
declare const _default: {
    title: string;
    enablers: (string | RegExp)[];
    isEnabled: IsPluginEnabled;
    config: string[];
    production: string[];
    resolveConfig: ResolveConfig<NetlifyConfig>;
};
export default _default;
