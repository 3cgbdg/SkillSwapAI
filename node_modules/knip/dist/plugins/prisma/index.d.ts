import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { PrismaConfig } from './types.js';
declare const _default: {
    title: string;
    enablers: (string | RegExp)[];
    isEnabled: IsPluginEnabled;
    config: string[];
    args: {
        config: boolean;
    };
    resolveConfig: ResolveConfig<PrismaConfig>;
};
export default _default;
