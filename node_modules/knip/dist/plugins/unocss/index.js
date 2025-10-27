import { hasDependency } from '../../util/plugin.js';
import { toUnconfig } from '../../util/plugin-config.js';
const title = 'UnoCSS';
const enablers = ['unocss'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const config = [...toUnconfig('uno.config'), ...toUnconfig('unocss.config')];
export default {
    title,
    enablers,
    isEnabled,
    config,
};
