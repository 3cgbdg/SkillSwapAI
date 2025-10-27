import type { ParsedArgs } from 'minimist';
import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import { type Input } from '../../util/input.js';
import type { ViteConfigOrFn, VitestWorkspaceConfig } from './types.js';
export declare const resolveConfig: ResolveConfig<ViteConfigOrFn | VitestWorkspaceConfig>;
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    config: string[];
    entry: string[];
    resolveConfig: ResolveConfig<ViteConfigOrFn | VitestWorkspaceConfig>;
    args: {
        config: boolean;
        resolveInputs: (parsed: ParsedArgs) => Input[];
    };
};
export default _default;
