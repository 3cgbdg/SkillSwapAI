import { hasDependency } from '../../util/plugin.js';
import { toUnconfig } from '../../util/plugin-config.js';
const title = 'node-modules-inspector';
const enablers = ['node-modules-inspector'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const config = [...toUnconfig('node-modules-inspector.config')];
const args = {
    config: true,
};
export default {
    title,
    enablers,
    isEnabled,
    config,
    args,
};
