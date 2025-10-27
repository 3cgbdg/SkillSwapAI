import { hasDependency } from '../../util/plugin.js';
import { toC12config } from '../../util/plugin-config.js';
const title = 'bumpp';
const enablers = ['bumpp'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const entry = ['package.json', ...toC12config('bump')];
export default {
    title,
    enablers,
    isEnabled,
    entry,
};
