"use client";

import { Logo } from "@/components/brand/Logo";

export function AuthBrand() {
  return (
    <div className="mb-1 flex flex-col items-center gap-4">
      <Logo size={44} />
      <div className="text-center">
        <h1 className="font-heading text-2xl leading-8 font-bold">
          <span className="text-primary">Skill</span>
          <span className="text-brand-accent">Swap</span>
          <span className="text-foreground">AI</span>
        </h1>
      </div>
    </div>
  );
}
