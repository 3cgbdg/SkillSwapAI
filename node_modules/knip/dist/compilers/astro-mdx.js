import { fencedCodeBlockMatcher, importMatcher, importsWithinFrontmatter } from './compilers.js';
const astroMDXDependencies = ['@astrojs/mdx', '@astrojs/starlight'];
const frontmatterImportFields = ['layout'];
const condition = (hasDependency) => astroMDXDependencies.some(hasDependency);
const compiler = (text) => {
    const imports = text.replace(fencedCodeBlockMatcher, '').matchAll(importMatcher);
    const frontmatterImports = importsWithinFrontmatter(text, frontmatterImportFields);
    return [...imports, frontmatterImports].join('\n');
};
export default { condition, compiler };
