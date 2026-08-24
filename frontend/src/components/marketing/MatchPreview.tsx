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
      aria-label="An AI match card for Maya Chen, 96% compatible — she teaches TypeScript and React, and wants to learn Product Design and UX Research."
      className={cn("w-full max-w-sm", className)}
    >
      <CardHeader className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
        <UserAvatar name="Maya Chen" size="lg" />
        <div className="min-w-0">
          <CardTitle className="truncate text-lg">Maya Chen</CardTitle>
          <p className="text-primary mt-1 text-xs font-semibold">
            Why this match?
          </p>
        </div>
        <MetricRing value={96} label="96% compatibility" />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="border-primary/20 bg-primary/5 text-muted-foreground rounded-xl border px-3 py-2 text-xs leading-5">
          Strong two-way fit: Maya can guide your TypeScript goals while your
          product design experience supports what she wants to learn.
        </p>
        <SwapAxis
          teach={[{ title: "TypeScript" }, { title: "React" }]}
          learn={[{ title: "Product Design" }, { title: "UX Research" }]}
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
          Start learning journey
        </span>
      </CardFooter>
    </Card>
  );
}
