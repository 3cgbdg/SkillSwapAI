import { hasDependency } from '../../util/plugin.js';
const title = 'SVGO';
const enablers = ['svgo'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const entry = ['svgo.config.{js,cjs,mjs}'];
export default {
    title,
    enablers,
    isEnabled,
    entry,
};
