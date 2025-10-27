import { hasDependency } from '../../util/plugin.js';
const title = 'playwright-test';
const enablers = ['playwright-test'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const args = {
    positional: true,
    args: (args) => args.filter(arg => arg !== 'install' && arg !== 'test'),
    config: true,
};
export default {
    title,
    enablers,
    isEnabled,
    args,
};
