"use client";

import type { ReactNode } from "react";

import { SkillSwapMark } from "@/components/illustrations/SkillSwapMark";
import {
  HIGHLIGHTS,
  SITE_SUBHEADLINE,
  SITE_TAGLINE,
} from "@/components/marketing/content";

export function AuthSplitPane({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
        {children}
      </div>

      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-16 xl:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full bg-brand-accent/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-[24rem] rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <div className="relative flex max-w-md flex-col gap-10">
          <SkillSwapMark className="h-28 w-auto" />

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-display leading-[1.05] font-semibold">
              {SITE_TAGLINE}
            </h2>
            <p className="text-base text-primary-foreground/80">
              {SITE_SUBHEADLINE}
            </p>
          </div>

          <ul className="flex flex-col gap-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-primary-foreground/70">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
