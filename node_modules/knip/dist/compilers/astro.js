import { fencedCodeBlockMatcher, importMatcher } from './compilers.js';
const condition = (hasDependency) => hasDependency('astro');
const taggedTemplateMatcher = /\w+(?:\.\w+)*`[\s\S]*?`/g;
const compiler = (text) => {
    const cleanedText = text.replace(fencedCodeBlockMatcher, '').replace(taggedTemplateMatcher, '""');
    return [...cleanedText.matchAll(importMatcher)].join('\n');
};
export default { condition, compiler };
