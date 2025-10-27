import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { MochaConfig } from './types.js';
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    entry: string[];
    resolveConfig: ResolveConfig<MochaConfig>;
    args: {
        nodeImportArgs: boolean;
    };
};
export default _default;
