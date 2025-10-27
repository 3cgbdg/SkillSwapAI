import { hasDependency } from '../../util/plugin.js';
const title = 'Danger';
const enablers = ['danger'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const entry = ['dangerfile.{js,cjs,mjs,ts}'];
export default {
    title,
    enablers,
    isEnabled,
    entry,
};
