import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { SkillSwapMark } from "@/components/illustrations/SkillSwapMark";
import { SITE_SUBHEADLINE, SITE_TAGLINE } from "@/components/marketing/content";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export function MarketingHero() {
  return (
    <section aria-labelledby="hero-heading" className="py-16 md:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-up flex flex-col items-start gap-6">
          <Badge variant="secondary">AI-matched skill exchange</Badge>

          <h1
            id="hero-heading"
            className="font-heading text-display font-semibold"
          >
            {SITE_TAGLINE}
          </h1>

          <p className="text-muted-foreground max-w-xl text-body">
            {SITE_SUBHEADLINE}
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/auth/signup"
              className={buttonVariants({ size: "lg" })}
            >
              Create your free account
            </Link>
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Log in
            </Link>
          </div>

          <p className="text-muted-foreground text-body-sm">
            Free to join. Tell us what you can teach and what you want to learn
            — we&apos;ll do the matching.
          </p>
        </div>

        <HeroPanel />
      </Container>
    </section>
  );
}

function HeroPanel() {
  return (
    <div className="relative hidden overflow-hidden rounded-4xl bg-primary p-10 text-primary-foreground md:flex md:items-center md:justify-center lg:p-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-[24rem] rounded-full bg-brand-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-16 size-[20rem] rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <SkillSwapMark className="relative h-40 w-auto" />
    </div>
  );
}
