import { hasDependency } from '../../util/plugin.js';
const title = 'Prisma';
const enablers = ['prisma', /^@prisma\/.*/];
const isEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);
const config = ['prisma.config.ts', 'package.json'];
const resolveConfig = async (config, options) => {
    if (options.configFileName === 'package.json' && config.seed) {
        return options.getInputsFromScripts(config.seed);
    }
    return [];
};
const args = {
    config: true,
};
export default {
    title,
    enablers,
    isEnabled,
    config,
    args,
    resolveConfig,
};
