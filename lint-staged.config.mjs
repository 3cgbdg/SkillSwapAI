import path from "node:path";
import process from "node:process";

/** Safe for `string-argv` + Windows paths with spaces. */
function shellArg(arg) {
  const s = String(arg);
  if (!/[ \t"]/g.test(s)) return s;
  return `"${s.replace(/"/g, '\\"')}"`;
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
    "--max-warnings",
    "0",
    "--fix",
    ...relFiles.map(shellArg),
  ].join(" ");
}

export default {
  "frontend/**/*.{js,jsx,mjs,cjs,ts,tsx}": (filenames) =>
    eslintCommand("frontend", filenames),
  "backend/**/*.ts": (filenames) => eslintCommand("backend", filenames),
};
