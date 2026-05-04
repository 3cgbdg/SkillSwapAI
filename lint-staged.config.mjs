import path from "node:path";

function quoteFiles(files) {
  return files.map((f) => JSON.stringify(f)).join(" ");
}

export default {
  "frontend/**/*.{js,jsx,mjs,cjs,ts,tsx}": (filenames) => {
    if (!filenames.length) return [];
    const rel = filenames.map((f) =>
      path.relative("frontend", path.resolve(f)),
    );
    return `(cd frontend && npx eslint --max-warnings 0 --fix ${quoteFiles(rel)})`;
  },
  "backend/**/*.ts": (filenames) => {
    if (!filenames.length) return [];
    const rel = filenames.map((f) =>
      path.relative("backend", path.resolve(f)),
    );
    return `(cd backend && npx eslint --max-warnings 0 --fix ${quoteFiles(rel)})`;
  },
};
