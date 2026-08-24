import { Book } from "lucide-react";

import { MetricRing, SwapAxis } from "@/components/composites";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

/**
 * A match card, built from the same MetricRing / SwapAxis / Card primitives the
 * real Discover screen uses — so this is the actual UI with example data rather
 * than a mockup that can drift. Decorative: exposed to assistive tech as a
 * single labelled image, the way a product screenshot would be.
 */
export function MatchPreview({ className }: { className?: string }) {
  return (
    <Card
      elevation="raised"
      role="img"
      aria-label="A match card for Maya, 92% compatible — she teaches Spanish and Illustration, and wants to learn React and TypeScript."
      className={cn("w-full max-w-sm", className)}
    >
      <CardHeader className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
        <UserAvatar name="Maya O" size="lg" />
        <div className="min-w-0">
          <CardTitle className="truncate text-lg">Maya</CardTitle>
          <p className="text-primary mt-1 text-xs font-semibold">
            Why this match?
          </p>
        </div>
        <MetricRing value={92} label="92% compatibility" />
      </CardHeader>

      <CardContent>
        <SwapAxis
          teach={[{ title: "Spanish" }, { title: "Illustration" }]}
          learn={[{ title: "React" }, { title: "TypeScript" }]}
        />
      </CardContent>

      <CardFooter className="mt-auto border-t pt-4">
        <span
          className={cn(
            buttonVariants({ size: "sm" }),
            "pointer-events-none w-full"
          )}
        >
          <Book className="size-4" aria-hidden />
          Generate plan
        </span>
      </CardFooter>
    </Card>
  );
}
