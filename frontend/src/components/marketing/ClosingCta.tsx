import Link from "next/link";

import { CLOSING_CTA } from "@/components/marketing/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClosingCta() {
  return (
    <div className="relative overflow-hidden rounded-4xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-[22rem] rounded-full bg-brand-accent/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <h2 id="cta-heading" className="font-heading text-h1">
          {CLOSING_CTA.title}
        </h2>
        <p className="text-primary-foreground/80 text-body">
          {CLOSING_CTA.description}
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/auth/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-background text-foreground hover:bg-background/90"
            )}
          >
            {CLOSING_CTA.action}
          </Link>
          <Link
            href="/auth/login"
            className="text-primary-foreground/90 text-body-sm underline underline-offset-4 hover:text-primary-foreground"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
