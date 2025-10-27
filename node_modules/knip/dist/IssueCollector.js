import picomatch from 'picomatch';
import { initCounters, initIssues } from './util/issue-initializers.js';
import { timerify } from './util/Performance.js';
import { join, relative } from './util/path.js';
const isMatch = timerify(picomatch.isMatch, 'isMatch');
export class IssueCollector {
    cwd;
    rules;
    filter;
    issues = initIssues();
    counters = initCounters();
    referencedFiles = new Set();
    configurationHints = new Map();
    tagHints = new Set();
    ignorePatterns = new Set();
    ignoreFilesPatterns = new Set();
    isMatch;
    isFileMatch;
    issueMatchers = new Map();
    constructor(options) {
        this.cwd = options.cwd;
        this.rules = options.rules;
        this.filter = options.workspace ? join(options.cwd, options.workspace) : undefined;
        this.isMatch = () => false;
        this.isFileMatch = () => false;
    }
    addIgnorePatterns(patterns) {
        for (const pattern of patterns)
            this.ignorePatterns.add(pattern);
        const p = [...this.ignorePatterns];
        this.isMatch = (filePath) => isMatch(filePath, p, { dot: true });
    }
    addIgnoreFilesPatterns(patterns) {
        for (const pattern of patterns)
            this.ignoreFilesPatterns.add(pattern);
        const p = [...this.ignoreFilesPatterns];
        this.isFileMatch = (filePath) => isMatch(filePath, p, { dot: true });
    }
    setIgnoreIssues(ignoreIssues) {
        if (!ignoreIssues)
            return;
        const issueTypePatterns = new Map();
        for (const [pattern, issueTypes] of Object.entries(ignoreIssues)) {
            for (const issueType of issueTypes) {
                if (!issueTypePatterns.has(issueType)) {
                    issueTypePatterns.set(issueType, []);
                }
                issueTypePatterns.get(issueType)?.push(pattern);
            }
        }
        for (const [issueType, patterns] of issueTypePatterns) {
            this.issueMatchers.set(issueType, (filePath) => isMatch(filePath, patterns, { dot: true }));
        }
    }
    shouldIgnoreIssue(filePath, issueType) {
        const matcher = this.issueMatchers.get(issueType);
        if (!matcher)
            return false;
        const relativePath = relative(this.cwd, filePath);
        return matcher(relativePath);
    }
    addFileCounts({ processed, unused }) {
        this.counters.processed += processed;
        this.counters.total += processed + unused;
    }
    addFilesIssues(filePaths) {
        for (const filePath of filePaths) {
            if (this.filter && !filePath.startsWith(`${this.filter}/`))
                continue;
            if (this.referencedFiles.has(filePath))
                continue;
            if (this.isMatch(filePath))
                continue;
            if (this.isFileMatch(filePath))
                continue;
            if (this.shouldIgnoreIssue(filePath, 'files'))
                continue;
            this.issues.files.add(filePath);
            const symbol = relative(this.cwd, filePath);
            this.issues._files[symbol] = [{ type: 'files', filePath, symbol, severity: this.rules.files }];
            this.counters.files++;
            this.counters.processed++;
        }
    }
    addIssue(issue) {
        if (this.filter && !issue.filePath.startsWith(`${this.filter}/`))
            return;
        if (this.isMatch(issue.filePath))
            return;
        if (this.shouldIgnoreIssue(issue.filePath, issue.type))
            return;
        const key = relative(this.cwd, issue.filePath);
        const { type } = issue;
        issue.severity = this.rules[type];
        const issues = this.issues[type];
        issues[key] = issues[key] ?? {};
        const symbol = issue.parentSymbol ? `${issue.parentSymbol}.${issue.symbol}` : issue.symbol;
        if (!issues[key][symbol]) {
            issues[key][symbol] = issue;
            this.counters[issue.type]++;
        }
        return true;
    }
    addConfigurationHint(issue) {
        const key = `${issue.workspaceName}::${issue.type}::${issue.identifier}`;
        if (!this.configurationHints.has(key))
            this.configurationHints.set(key, issue);
    }
    addTagHint(issue) {
        this.tagHints.add(issue);
    }
    purge() {
        const unusedFiles = this.issues.files;
        this.issues = initIssues();
        this.counters = initCounters();
        return unusedFiles;
    }
    getIssues() {
        return {
            issues: this.issues,
            counters: this.counters,
            tagHints: this.tagHints,
            configurationHints: new Set(this.configurationHints.values()),
        };
    }
    retainedIssues = [];
    retainIssue(issue) {
        this.retainedIssues.push(issue);
    }
    getRetainedIssues() {
        return this.retainedIssues;
    }
}
