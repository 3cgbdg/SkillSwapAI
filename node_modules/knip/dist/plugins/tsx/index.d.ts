import type { IsPluginEnabled, ResolveConfig } from '../../types/config.js';
import type { PackageJson } from '../../types/package-json.js';
declare const _default: {
    title: string;
    isEnabled: IsPluginEnabled;
    packageJsonPath: (id: PackageJson) => PackageJson;
    config: string[];
    resolveConfig: ResolveConfig<PackageJson>;
    args: {
        positional: boolean;
        nodeImportArgs: boolean;
        args: (args: string[]) => string[];
    };
};
export default _default;
