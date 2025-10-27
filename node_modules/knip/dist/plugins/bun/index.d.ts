import type { ResolveConfig } from '../../types/config.js';
import type { PackageJson } from '../../types/package-json.js';
declare const _default: {
    title: string;
    enablers: string[];
    isEnabled: () => boolean;
    config: string[];
    packageJsonPath: (id: PackageJson) => PackageJson;
    resolveConfig: ResolveConfig<PackageJson>;
};
export default _default;
