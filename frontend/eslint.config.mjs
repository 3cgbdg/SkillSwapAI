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
      // src/features/** doesn't exist yet — kept as a forward-looking glob
      // entry so feature-organized code is covered automatically if that
      // folder is ever introduced, rather than silently missed.
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
  {
    // components/calendar/** is deliberately exempt from the *layering*
    // rule only: it carries ~10 pre-existing radius/border/size literals and
    // no step in the UI/UX redesign plan restructures it (see the plan's
    // Out of scope #8). This is a visible, intentional hole, not an
    // oversight — migrating the calendar folder onto composites is
    // unbudgeted follow-up work. The repo-wide gray/hex-color ban (the first
    // "src/**" rule above) still applies here — re-declared rather than
    // turned off, since "no-restricted-syntax" is one rule name shared by
    // both checks and a later "off" would silently disable both.
    files: ["src/components/calendar/**/*.{js,jsx,ts,tsx}"],
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
];

export default eslintConfig;
