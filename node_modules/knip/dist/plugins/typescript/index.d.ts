import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { TsConfigJson } from '../../types/tsconfig-json.js';
export declare const docs: {
    note: string;
};
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    resolveConfig: ResolveConfig<TsConfigJson>;
    args: {
        binaries: string[];
        string: string[];
        alias: {
            project: string[];
        };
        config: [string, (p: string) => string][];
    };
};
export default _default;
