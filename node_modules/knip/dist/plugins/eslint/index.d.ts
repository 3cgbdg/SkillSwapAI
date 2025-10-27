import type { ParsedArgs } from 'minimist';
import type { IsLoadConfig, IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import { type Input } from '../../util/input.js';
import type { ESLintConfigDeprecated } from './types.js';
export declare const docs: {
    note: string;
};
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: IsPluginEnabled;
    packageJsonPath: string;
    config: string[];
    args: {
        config: boolean;
        boolean: string[];
        resolveInputs: (parsed: ParsedArgs) => Input[];
    };
    isLoadConfig: IsLoadConfig;
    resolveConfig: ResolveConfig<ESLintConfigDeprecated>;
};
export default _default;
