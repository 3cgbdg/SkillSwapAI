import path from "node:path";
import process from "node:process";

/** Safe for `string-argv` + Windows paths with spaces. */
function shellArg(arg) {
  const s = String(arg);
  if (!/[ \t"]/g.test(s)) return s;
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Run package-local ESLint via the current Node binary (no pnpm/npx on PATH).
 * Paths are repo-root-relative; lint-staged runs with the repo as cwd.
 */
function eslintCommand(pkg, filenames) {
  if (!filenames.length) return [];
  const repoRoot = process.cwd();
  const pkgRoot = path.join(repoRoot, pkg);
  const eslintBin = path.join(
    pkgRoot,
    "node_modules",
    "eslint",
    "bin",
    "eslint.js",
  );
  const eslintConfig = path.join(pkgRoot, "eslint.config.mjs");
  const relFiles = filenames.map((f) =>
    path.relative(repoRoot, path.resolve(f)).split(path.sep).join("/"),
  );
  return [
    shellArg(process.execPath),
    shellArg(eslintBin),
    "--config",
    shellArg(eslintConfig),
    "--fix",
    ...relFiles.map(shellArg),
  ].join(" ");
}

/**
 * Run package-local Prettier via the current Node binary (no pnpm/npx on PATH).
 */
function prettierCommand(pkg, filenames) {
  if (!filenames.length) return [];
  const repoRoot = process.cwd();
  const pkgRoot = path.join(repoRoot, pkg);
  const prettierBin = path.join(
    pkgRoot,
    "node_modules",
    "prettier",
    "bin",
    "prettier.cjs",
  );
  const relFiles = filenames.map((f) =>
    path.relative(repoRoot, path.resolve(f)).split(path.sep).join("/"),
  );
  return [
    shellArg(process.execPath),
    shellArg(prettierBin),
    "--write",
    ...relFiles.map(shellArg),
  ].join(" ");
}

function eslintFilenames(filenames) {
  return filenames.filter((f) => /\.(js|jsx|mjs|cjs|ts|tsx)$/i.test(f));
}

export default {
  "backend/**/*.{ts,json,md}": (filenames) => {
    const prettier = prettierCommand("backend", filenames);
    const eslint = eslintCommand("backend", eslintFilenames(filenames));
    const cmds = [];
    if (typeof prettier === "string" && prettier.length > 0) cmds.push(prettier);
    if (typeof eslint === "string" && eslint.length > 0) cmds.push(eslint);
    return cmds;
  },
  "frontend/**/*.{js,jsx,mjs,cjs,ts,tsx,json,css,md}": (filenames) => {
    const prettier = prettierCommand("frontend", filenames);
    // Only lint source/config JS/TS — skip package.json / mcp.json / etc.
    const eslintFiles = eslintFilenames(filenames).filter((f) => {
      const normalized = f.replace(/\\/g, "/");
      return (
        normalized.includes("/src/") ||
        normalized.endsWith("eslint.config.mjs") ||
        normalized.endsWith("next.config.ts") ||
        normalized.endsWith("next.config.mjs") ||
        normalized.endsWith("next.config.js")
      );
    });
    const eslint = eslintCommand("frontend", eslintFiles);
    const cmds = [];
    if (typeof prettier === "string" && prettier.length > 0) cmds.push(prettier);
    if (typeof eslint === "string" && eslint.length > 0) cmds.push(eslint);
    return cmds;
  },
};
