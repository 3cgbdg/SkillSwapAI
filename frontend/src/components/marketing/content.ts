import { CalendarClock, MessagesSquare, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Single source of truth for product copy shared between the marketing landing
 * page and the auth screens' split-pane panel. Kept as plain data (no JSX, no
 * "use client") so server components can consume it directly — the two surfaces
 * render this same copy with very different markup, and only the words should
 * be shared.
 */

export const SITE_TAGLINE = "Swap skills. Grow together.";

export const SITE_SUBHEADLINE =
  "SkillSwap AI matches you with people who can teach what you want to learn — and want to learn what you can teach.";

type Highlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const HIGHLIGHTS: readonly Highlight[] = [
  {
    icon: Sparkles,
    title: "AI-matched partners",
    description: "We pair you with people whose skills complete yours.",
  },
  {
    icon: MessagesSquare,
    title: "Built-in chat",
    description: "Message your match without leaving the app.",
  },
  {
    icon: CalendarClock,
    title: "Simple scheduling",
    description: "Book and track sessions from one calendar.",
  },
];

type HowItWorksStep = {
  title: string;
  description: string;
};

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    title: "Tell us your skills",
    description:
      "Add what you can teach and what you want to learn. SkillSwap AI can suggest skills to get you started.",
  },
  {
    title: "Get matched, get a plan",
    description:
      "We find someone whose skills complement yours and generate a structured training plan with modules and resources for both of you.",
  },
  {
    title: "Meet, learn, review",
    description:
      "Chat in the app, book sessions on the shared calendar, and rate each session when it's done.",
  },
];

export const CLOSING_CTA = {
  title: "Someone out there wants to learn what you know.",
  description:
    "Create an account, list two or three skills, and see who SkillSwap pairs you with.",
  action: "Get started free",
} as const;
