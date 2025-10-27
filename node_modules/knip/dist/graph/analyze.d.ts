import type { ConfigurationChief } from '../ConfigurationChief.js';
import type { ConsoleStreamer } from '../ConsoleStreamer.js';
import type { DependencyDeputy } from '../DependencyDeputy.js';
import type { IssueCollector } from '../IssueCollector.js';
import type { IssueFixer } from '../IssueFixer.js';
import type { PrincipalFactory } from '../PrincipalFactory.js';
import type { ModuleGraph } from '../types/module-graph.js';
import type { MainOptions } from '../util/create-options.js';
interface AnalyzeOptions {
    analyzedFiles: Set<string>;
    chief: ConfigurationChief;
    collector: IssueCollector;
    deputy: DependencyDeputy;
    entryPaths: Set<string>;
    factory: PrincipalFactory;
    fixer: IssueFixer;
    graph: ModuleGraph;
    streamer: ConsoleStreamer;
    unreferencedFiles: Set<string>;
    options: MainOptions;
}
export declare const analyze: ({ analyzedFiles, chief, collector, deputy, entryPaths, factory, fixer, graph, streamer, unreferencedFiles, options, }: AnalyzeOptions) => Promise<() => Promise<void>>;
export {};
