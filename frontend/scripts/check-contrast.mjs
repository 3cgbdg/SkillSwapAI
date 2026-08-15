import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Re-runnable WCAG contrast checker for the design tokens in globals.css.
//
// Resolves var() chains (including multi-level aliases like --card ->
// --surface) and composites alpha-carrying colors (the --session-*-bg
// tokens) over a named backdrop before measuring contrast. Every pair below
// is asserted against WCAG AA — 4.5:1 for text, 3:1 for non-text UI — in
// both :root and .dark. Any token this script cannot resolve is a hard
// failure, not a skip: a silent skip would make this gate worthless.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, "../src/styles/globals.css");
const css = fs.readFileSync(cssPath, "utf8");

function extractBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([\\s\\S]*?)\\}`, "m");
  const match = source.match(re);
  if (!match) {
    throw new Error(`Could not find "${selector}" block in globals.css`);
  }
  return match[1];
}

function parseDeclarations(block) {
  const map = new Map();
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) {
    map.set(`--${m[1]}`, m[2].trim());
  }
  return map;
}

const rootVars = parseDeclarations(extractBlock(css, ":root"));
const darkVars = parseDeclarations(extractBlock(css, ".dark"));

function rawValue(token, themeVars) {
  if (themeVars.has(token)) return themeVars.get(token);
  if (rootVars.has(token)) return rootVars.get(token);
  return undefined;
}

const VAR_RE = /^var\((--[a-zA-Z0-9-]+)\)$/;
const OKLCH_RE =
  /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)%\s*)?\)$/;

// Resolves a token to { l, c, h, alpha }, following var() chains. Throws on
// anything it cannot resolve — no silent skipping.
function resolveColor(token, themeVars, seen = new Set()) {
  if (seen.has(token)) {
    throw new Error(`Circular var() reference resolving ${token}`);
  }
  seen.add(token);

  const raw = rawValue(token, themeVars);
  if (raw === undefined) {
    throw new Error(
      `Unresolvable token: ${token} (not found in theme or root)`
    );
  }

  const varMatch = raw.match(VAR_RE);
  if (varMatch) {
    return resolveColor(varMatch[1], themeVars, seen);
  }

  const oklchMatch = raw.match(OKLCH_RE);
  if (!oklchMatch) {
    throw new Error(`Unresolvable color value for ${token}: "${raw}"`);
  }

  const [, l, c, h, alphaPct] = oklchMatch;
  return {
    l: parseFloat(l),
    c: parseFloat(c),
    h: parseFloat(h),
    alpha: alphaPct !== undefined ? parseFloat(alphaPct) / 100 : 1,
  };
}

// OKLCH -> OKLab -> linear sRGB (Björn Ottosson's reference matrices).
function oklchToLinearSrgb({ l, c, h }) {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  // Tokens are hand-authored for on-screen use; clamp defensively rather
  // than let an out-of-gamut value produce a nonsensical luminance.
  const clamp = (x) => Math.min(1, Math.max(0, x));
  return { r: clamp(r), g: clamp(g), b: clamp(bl) };
}

function relativeLuminance({ r, g, b }) {
  // Values are already linear-light (not gamma-encoded), so the WCAG
  // formula's piecewise gamma-decode step is not needed here.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function compositeOver(fgLinear, fgAlpha, backdropLinear) {
  return {
    r: fgLinear.r * fgAlpha + backdropLinear.r * (1 - fgAlpha),
    g: fgLinear.g * fgAlpha + backdropLinear.g * (1 - fgAlpha),
    b: fgLinear.b * fgAlpha + backdropLinear.b * (1 - fgAlpha),
  };
}

function resolveLinear(token, themeVars, backdropToken) {
  const color = resolveColor(token, themeVars);
  let linear = oklchToLinearSrgb(color);
  if (color.alpha < 1) {
    if (!backdropToken) {
      throw new Error(
        `${token} carries alpha (${color.alpha}) but no backdrop was named to composite over`
      );
    }
    const backdrop = resolveColor(backdropToken, themeVars);
    if (backdrop.alpha < 1) {
      throw new Error(
        `Backdrop ${backdropToken} for ${token} must itself be opaque`
      );
    }
    linear = compositeOver(linear, color.alpha, oklchToLinearSrgb(backdrop));
  }
  return linear;
}

function contrastRatio(linearA, linearB) {
  const lA = relativeLuminance(linearA);
  const lB = relativeLuminance(linearB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- The checked-in pair table -------------------------------------------
//
// kind: "text" -> 4.5:1 · "nontext" -> 3:1
// backdrop: required when `bg` carries alpha (the --session-*-bg tokens).

const PAIRS = [
  // A17 — text pairs that must pass AA in both themes.
  {
    id: "foreground/background",
    fg: "--foreground",
    bg: "--background",
    kind: "text",
  },
  {
    id: "muted-foreground/background",
    fg: "--muted-foreground",
    bg: "--background",
    kind: "text",
  },
  {
    id: "muted-foreground/muted",
    fg: "--muted-foreground",
    bg: "--muted",
    kind: "text",
  },
  {
    id: "primary-foreground/primary",
    fg: "--primary-foreground",
    bg: "--primary",
    kind: "text",
  },
  {
    id: "teach-badge-fg/teach-soft",
    fg: "--accent-teach",
    bg: "--accent-teach-soft",
    kind: "text",
  },
  {
    id: "learn-badge-fg/learn-soft",
    fg: "--accent-learn",
    bg: "--accent-learn-soft",
    kind: "text",
  },
  // A9 — success is used as text at ChatThread.tsx:99 and TaskChecklistLink.tsx:27.
  {
    id: "success/background",
    fg: "--success",
    bg: "--background",
    kind: "text",
  },
  { id: "success/card", fg: "--success", bg: "--card", kind: "text" },
  // Session chips (calendar): fg is opaque text rendered on an alpha bg
  // composited over the card surface it's placed on.
  {
    id: "session-plum-fg/session-plum-bg",
    fg: "--session-plum-fg",
    bg: "--session-plum-bg",
    kind: "text",
    backdrop: "--card",
  },
  {
    id: "session-amber-fg/session-amber-bg",
    fg: "--session-amber-fg",
    bg: "--session-amber-bg",
    kind: "text",
    backdrop: "--card",
  },
  {
    id: "session-sage-fg/session-sage-bg",
    fg: "--session-sage-fg",
    bg: "--session-sage-bg",
    kind: "text",
    backdrop: "--card",
  },
  {
    id: "session-coral-fg/session-coral-bg",
    fg: "--session-coral-fg",
    bg: "--session-coral-bg",
    kind: "text",
    backdrop: "--card",
  },
  {
    id: "session-slate-fg/session-slate-bg",
    fg: "--session-slate-fg",
    bg: "--session-slate-bg",
    kind: "text",
    backdrop: "--card",
  },
  {
    id: "session-violet-fg/session-violet-bg",
    fg: "--session-violet-fg",
    bg: "--session-violet-bg",
    kind: "text",
    backdrop: "--card",
  },

  // A18 — non-text UI pairs that must pass 3:1 in both themes.
  { id: "ring/background", fg: "--ring", bg: "--background", kind: "nontext" },
  { id: "ring/card", fg: "--ring", bg: "--card", kind: "nontext" },
  {
    id: "input/background",
    fg: "--input",
    bg: "--background",
    kind: "nontext",
  },
  { id: "input/card", fg: "--input", bg: "--card", kind: "nontext" },
  {
    id: "brand-accent/background",
    fg: "--brand-accent",
    bg: "--background",
    kind: "nontext",
  },
  {
    id: "brand-accent/card",
    fg: "--brand-accent",
    bg: "--card",
    kind: "nontext",
  },
  {
    id: "accent-teach/card",
    fg: "--accent-teach",
    bg: "--card",
    kind: "nontext",
  },
  {
    id: "accent-learn/card",
    fg: "--accent-learn",
    bg: "--card",
    kind: "nontext",
  },
];

const THRESHOLD = { text: 4.5, nontext: 3.0 };
const EPSILON = 1e-6;

function runTheme(themeName, themeVars) {
  const results = [];
  for (const pair of PAIRS) {
    let fgLinear, bgLinear;
    try {
      fgLinear = resolveLinear(pair.fg, themeVars);
      bgLinear = resolveLinear(pair.bg, themeVars, pair.backdrop);
    } catch (err) {
      results.push({
        theme: themeName,
        id: pair.id,
        kind: pair.kind,
        error: err.message,
      });
      continue;
    }
    const ratio = contrastRatio(fgLinear, bgLinear);
    const threshold = THRESHOLD[pair.kind];
    const pass = ratio + EPSILON >= threshold;
    results.push({
      theme: themeName,
      id: pair.id,
      kind: pair.kind,
      ratio,
      threshold,
      pass,
    });
  }
  return results;
}

const allResults = [
  ...runTheme("light", rootVars),
  ...runTheme("dark", darkVars),
];

let failures = 0;
for (const r of allResults) {
  if (r.error) {
    failures++;
    process.stdout.write(
      `FAIL  ${r.theme.padEnd(5)} ${r.id.padEnd(35)} unresolvable: ${r.error}\n`
    );
    continue;
  }
  const label = r.pass ? "PASS" : "FAIL";
  if (!r.pass) failures++;
  process.stdout.write(
    `${label}  ${r.theme.padEnd(5)} ${r.id.padEnd(35)} ${r.ratio.toFixed(2)}:1  (need ${r.threshold}:1, ${r.kind})\n`
  );
}

process.stdout.write(
  `\n${allResults.length - failures}/${allResults.length} pairs pass.\n`
);

if (failures > 0) {
  process.stdout.write(`${failures} failure(s) — see FAIL rows above.\n`);
  process.exit(1);
}
