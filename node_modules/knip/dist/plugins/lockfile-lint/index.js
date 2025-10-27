import { hasDependency } from '../../util/plugin.js';
import { toCosmiconfig } from '../../util/plugin-config.js';
const title = 'lockfile-lint';
const enablers = ['lockfile-lint'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const config = ['package.json', ...toCosmiconfig('lockfile-lint', { additionalExtensions: ['toml'] })];
export default {
    title,
    enablers,
    isEnabled,
    config,
};
