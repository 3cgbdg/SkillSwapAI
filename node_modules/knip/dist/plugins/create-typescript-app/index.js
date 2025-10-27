import { hasDependency } from '../../util/plugin.js';
const title = 'create-typescript-app';
const enablers = ['create-typescript-app'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const entry = ['create-typescript-app.config.{js,cjs,mjs,ts}'];
export default {
    enablers,
    entry,
    isEnabled,
    title,
};
