import Link from "next/link";
import { Check } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { MatchPreview } from "@/components/marketing/MatchPreview";
import { SITE_SUBHEADLINE, SITE_TAGLINE } from "@/components/marketing/content";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const REASSURANCE = ["Free to join", "No card needed", "Two skills to start"];

export function MarketingHero() {
  return (
    <section aria-labelledby="hero-heading" className="py-16 md:py-24">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
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

          <Link href="/auth/signup" className={buttonVariants({ size: "lg" })}>
            Create your free account
          </Link>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {REASSURANCE.map((item) => (
              <li
                key={item}
                className="text-muted-foreground flex items-center gap-1.5 text-body-sm"
              >
                <Check className="text-primary size-4 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          <MatchPreview />
        </div>
      </Container>
    </section>
  );
}
