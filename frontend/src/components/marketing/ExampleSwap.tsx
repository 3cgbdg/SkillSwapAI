import { ArrowRight } from "lucide-react";

import { SkillPill } from "@/components/composites";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

/**
 * A concrete illustration of a single swap. Deliberately labelled as an example
 * rather than dressed up as a testimonial — the point is to make the abstraction
 * ("we pair complementary skills") land, not to imply these are real users.
 */
export function ExampleSwap({ className }: { className?: string }) {
  return (
    <Card
      elevation="raised"
      className={cn("w-full max-w-lg", className)}
      role="img"
      aria-label="Example swap: Maya teaches Spanish and wants React; Sam teaches React and wants Spanish."
    >
      <CardContent className="flex flex-col gap-5">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          An example swap
        </p>

        <div className="flex items-center gap-3">
          <UserAvatar name="Maya O" size="md" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-medium">Maya</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <SkillPill label="Spanish" variant="teach" />
              <ArrowRight
                className="text-muted-foreground size-3.5 shrink-0"
                aria-hidden
              />
              <SkillPill label="React" variant="learn" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserAvatar name="Sam K" size="md" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-medium">Sam</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <SkillPill label="React" variant="teach" />
              <ArrowRight
                className="text-muted-foreground size-3.5 shrink-0"
                aria-hidden
              />
              <SkillPill label="Spanish" variant="learn" />
            </div>
          </div>
        </div>

        <p className="text-muted-foreground border-t pt-4 text-body-sm">
          Each of them already has what the other wants. No money changes hands
          — that&apos;s the whole trade.
        </p>
      </CardContent>
    </Card>
  );
}
