import { toAlias } from '../../util/input.js';
import { join } from '../../util/path.js';
import { hasDependency } from '../../util/plugin.js';
import { config as viteConfig } from '../vite/index.js';
const title = 'Svelte';
const enablers = ['svelte'];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const entry = ['svelte.config.js', ...viteConfig];
const production = [
    'src/routes/**/+{page,server,page.server,error,layout,layout.server}{,@*}.{js,ts,svelte}',
    'src/hooks.{server,client}.{js,ts}',
    'src/params/*.{js,ts}',
];
const resolve = options => {
    const alias = toAlias('$app/*', [join(options.cwd, 'node_modules/@sveltejs/kit/src/runtime/app/*')]);
    return [alias];
};
export default {
    title,
    enablers,
    isEnabled,
    entry,
    production,
    resolve,
};
