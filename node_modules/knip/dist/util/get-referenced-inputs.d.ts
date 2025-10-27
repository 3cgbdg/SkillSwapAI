import type { ConfigurationChief, Workspace } from '../ConfigurationChief.js';
import type { DependencyDeputy } from '../DependencyDeputy.js';
import type { Issue } from '../types/issues.js';
import { type Input } from './input.js';
export declare const getReferencedInputsHandler: (deputy: DependencyDeputy, chief: ConfigurationChief, isGitIgnored: (s: string) => boolean, addIssue: (issue: Issue) => void) => (input: Input, workspace: Workspace) => string | undefined;
