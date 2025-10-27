import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { StorybookConfig } from './types.js';
declare const _default: {
    title: string;
    enablers: (string | RegExp)[];
    isEnabled: IsPluginEnabled;
    config: string[];
    entry: string[];
    project: string[];
    resolveConfig: ResolveConfig<StorybookConfig>;
};
export default _default;
