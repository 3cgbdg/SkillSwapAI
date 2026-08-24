import type { ReactNode } from "react";

import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

/**
 * A wide feature row: prose on one side, a product preview on the other.
 * `reverse` flips the sides so consecutive rows alternate instead of stacking
 * into the same three-column grid over and over.
 */
export function FeatureRow({
  eyebrow,
  title,
  headingId,
  children,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  headingId: string;
  children: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={cn("flex flex-col gap-4", reverse && "lg:order-2")}>
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          {eyebrow}
        </p>
        <h2 id={headingId} className="font-heading text-h2">
          {title}
        </h2>
        <div className="text-muted-foreground flex flex-col gap-3 text-body">
          {children}
        </div>
      </Reveal>

      <Reveal
        delay={120}
        className={cn(
          "flex justify-center lg:justify-end",
          reverse && "lg:order-1 lg:justify-start"
        )}
      >
        {visual}
      </Reveal>
    </div>
  );
}
