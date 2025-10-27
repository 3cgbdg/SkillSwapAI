import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import { type ConfigFile } from './helpers.js';
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    resolveConfig: ResolveConfig<ConfigFile>;
};
export default _default;
