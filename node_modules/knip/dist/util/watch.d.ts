import type { WatchListener } from 'node:fs';
import type { ConfigurationChief } from '../ConfigurationChief.js';
import type { IssueCollector } from '../IssueCollector.js';
import type { PrincipalFactory } from '../PrincipalFactory.js';
import type { ProjectPrincipal } from '../ProjectPrincipal.js';
import type { Issues } from '../types/issues.js';
import type { ModuleGraph } from '../types/module-graph.js';
import type { MainOptions } from './create-options.js';
export type OnUpdate = (options: {
    issues: Issues;
    duration?: number;
}) => void;
type Watch = {
    analyzedFiles: Set<string>;
    analyzeSourceFile: (filePath: string, principal: ProjectPrincipal) => void;
    chief: ConfigurationChief;
    collector: IssueCollector;
    analyze: () => Promise<void>;
    factory: PrincipalFactory;
    graph: ModuleGraph;
    isIgnored: (path: string) => boolean;
    onUpdate: OnUpdate;
    unreferencedFiles: Set<string>;
};
export declare const getWatchHandler: (options: MainOptions, { analyzedFiles, analyzeSourceFile, chief, collector, analyze, factory, graph, isIgnored, onUpdate, unreferencedFiles, }: Watch) => Promise<WatchListener<string | Buffer<ArrayBufferLike>>>;
export {};
