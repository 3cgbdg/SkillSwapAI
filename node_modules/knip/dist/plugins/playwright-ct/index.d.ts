import type { IsPluginEnabled } from '../../types/config.js';
declare const _default: {
    title: string;
    enablers: RegExp[];
    isEnabled: IsPluginEnabled;
    config: string[];
    entry: string[];
    resolveConfig: import("../../types/config.js").ResolveConfig<import("../playwright/types.js").PlaywrightTestConfig>;
};
export default _default;
