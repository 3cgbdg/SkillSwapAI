import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

/**
 * Section shell for the landing page. Owns the vertical rhythm, the optional
 * tonal background, and the sticky-header scroll offset — which keeps the route
 * file itself free of the utilities the layering ESLint rule bans under
 * src/app/**.
 */
export function MarketingSection({
  id,
  labelledBy,
  tone = "default",
  className,
  children,
}: {
  id?: string;
  labelledBy?: string;
  tone?: "default" | "muted";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-(--header-h) py-16 md:py-24",
        tone === "muted" && "bg-muted/40",
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
