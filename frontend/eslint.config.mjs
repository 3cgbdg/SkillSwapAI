import eslintConfigPrettier from "eslint-config-prettier";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintConfigPrettier,
  {
    settings: {
      next: {
        rootDir: ".",
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "no-console": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "error",
      // Ensure a11y stays on (Next may ship these as warns; keep recommended severity).
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/\\b(neutral|gray|slate|zinc)-(50|100|200|300|400|500|600|700|800|900|950)\\b/]",
          message:
            "Avoid Tailwind gray/neutral utilities — use semantic tokens (border-border, bg-muted, text-muted-foreground).",
        },
        {
          selector:
            "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message:
            "Avoid raw hex colors — use semantic design tokens (e.g. text-primary, bg-muted).",
        },
      ],
    },
  },
  {
    // Fixed third-party brand-mark colors (Google "G" logo), not themeable.
    files: ["src/components/auth/GoogleAuthButton.tsx"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // Node CLI utilities report progress/results via console output by design.
    files: ["scripts/**/*.{js,mjs}"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: [
      "src/app/**/*.{js,jsx,ts,tsx}",
      "src/features/**/*.{js,jsx,ts,tsx}",
      "src/components/matches/**/*.{js,jsx,ts,tsx}",
      "src/components/profile/**/*.{js,jsx,ts,tsx}",
      "src/components/chat/**/*.{js,jsx,ts,tsx}",
      "src/components/inbox/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(?:^|\\s)(?:rounded-|shadow-|border(?:$|-[trblxy]?$)|[hwp]-\\[|text-\\[|gap-\\[|top-\\[)/]",
          message:
            "Feature code cannot set radius, elevation, borders, or arbitrary sizes. Add a composite in components/composites/ instead.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] TemplateLiteral TemplateElement[value=/(?:^|\\s)(?:rounded-|shadow-|border(?:$|-[trblxy]?$)|[hwp]-\\[|text-\\[|gap-\\[|top-\\[)/]",
          message:
            "Feature code cannot set radius, elevation, borders, or arbitrary sizes. Add a composite in components/composites/ instead.",
        },
      ],
    },
  },
];

export default eslintConfig;
