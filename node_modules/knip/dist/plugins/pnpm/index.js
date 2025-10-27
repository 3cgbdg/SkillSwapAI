import { _firstGlob } from '../../util/glob.js';
const title = 'pnpm';
const isEnabled = async ({ cwd, manifest }) => Boolean(manifest.packageManager?.startsWith('pnpm@') ||
    (await _firstGlob({ cwd, patterns: ['pnpm-lock.yaml', 'pnpm-workspace.yaml'] })));
const isRootOnly = true;
const config = ['.pnpmfile.cjs'];
export default {
    title,
    isEnabled,
    isRootOnly,
    config,
};
