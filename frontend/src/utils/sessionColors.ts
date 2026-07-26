import type { SessionColorKey } from "@/types/session";

export const SESSION_COLOR_STYLES: Record<
  SessionColorKey,
  { bg: string; fg: string }
> = {
  plum: {
    bg: "oklch(0.42 0.12 285 / 18%)",
    fg: "oklch(0.35 0.1 285)",
  },
  amber: {
    bg: "oklch(0.78 0.15 70 / 22%)",
    fg: "oklch(0.45 0.12 70)",
  },
  sage: {
    bg: "oklch(0.6 0.14 150 / 20%)",
    fg: "oklch(0.38 0.1 150)",
  },
  coral: {
    bg: "oklch(0.68 0.19 30 / 20%)",
    fg: "oklch(0.42 0.16 30)",
  },
  slate: {
    bg: "oklch(0.5 0.02 285 / 15%)",
    fg: "oklch(0.32 0.02 285)",
  },
  violet: {
    bg: "oklch(0.55 0.18 290 / 20%)",
    fg: "oklch(0.38 0.14 290)",
  },
};

export function resolveSessionColor(key: string): {
  backgroundColor: string;
  color: string;
} {
  const style =
    SESSION_COLOR_STYLES[key as SessionColorKey] ?? SESSION_COLOR_STYLES.plum;
  return { backgroundColor: style.bg, color: style.fg };
}

export const SESSION_COLOR_KEYS = Object.keys(
  SESSION_COLOR_STYLES
) as SessionColorKey[];
