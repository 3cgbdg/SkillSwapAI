import type { SessionColorKey } from "@/types/session";

const SESSION_VAR_KEYS: Record<SessionColorKey, { bg: string; fg: string }> = {
  plum: {
    bg: "var(--session-plum-bg)",
    fg: "var(--session-plum-fg)",
  },
  amber: {
    bg: "var(--session-amber-bg)",
    fg: "var(--session-amber-fg)",
  },
  sage: {
    bg: "var(--session-sage-bg)",
    fg: "var(--session-sage-fg)",
  },
  coral: {
    bg: "var(--session-coral-bg)",
    fg: "var(--session-coral-fg)",
  },
  slate: {
    bg: "var(--session-slate-bg)",
    fg: "var(--session-slate-fg)",
  },
  violet: {
    bg: "var(--session-violet-bg)",
    fg: "var(--session-violet-fg)",
  },
};

export const SESSION_COLOR_STYLES: Record<
  SessionColorKey,
  { bg: string; fg: string }
> = SESSION_VAR_KEYS;

export function resolveSessionColor(key: string): {
  backgroundColor: string;
  color: string;
} {
  const style =
    SESSION_VAR_KEYS[key as SessionColorKey] ?? SESSION_VAR_KEYS.plum;
  return { backgroundColor: style.bg, color: style.fg };
}

export const SESSION_COLOR_KEYS = Object.keys(
  SESSION_VAR_KEYS
) as SessionColorKey[];
