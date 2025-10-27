import type { ConfigurationHintType, ReporterOptions } from '../../types/issues.js';
interface PrintHintOptions {
    type: ConfigurationHintType;
    identifier: string | RegExp;
    filePath: string;
    configFilePath?: string;
    workspaceName?: string;
    size?: number;
}
declare const hintPrinters: Map<ConfigurationHintType, {
    print: (options: PrintHintOptions) => string;
}>;
export { hintPrinters };
export declare const printConfigurationHints: ({ cwd, counters, issues, tagHints, configurationHints, isTreatConfigHintsAsErrors, includedWorkspaceDirs, configFilePath, }: ReporterOptions) => void;
