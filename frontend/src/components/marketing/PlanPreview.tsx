import { Check, Clock, Link as LinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    title: "Present-tense conversation",
    weeks: "Week 1",
    resource: "Warm-up script + 20 core verbs",
    done: true,
  },
  {
    title: "Past tense, and telling a story",
    weeks: "Week 2",
    resource: "Graded reader, chapters 1–3",
    done: true,
  },
  {
    title: "Ordering, asking, negotiating",
    weeks: "Week 3",
    resource: "Roleplay prompts for both of you",
    done: false,
  },
  {
    title: "Holding a 20-minute conversation",
    weeks: "Week 4",
    resource: "Recorded check-in + review",
    done: false,
  },
];

/**
 * A generated training plan, using the same Card / Badge primitives and the
 * module → timeline → resources shape the real plan screen renders. Decorative,
 * so it's exposed as one labelled image.
 */
export function PlanPreview({ className }: { className?: string }) {
  return (
    <Card
      elevation="raised"
      role="img"
      aria-label="A four-week AI-generated training plan for learning Spanish, with two modules complete, each listing a timeline and a suggested resource."
      className={cn("w-full max-w-md", className)}
    >
      <CardHeader bordered className="gap-1">
        <CardTitle className="text-lg">Your plan: Spanish</CardTitle>
        <p className="text-muted-foreground text-body-sm">
          Generated for you and Maya · 4 modules
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {MODULES.map((module) => (
          <div key={module.title} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                module.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              )}
            >
              {module.done ? <Check className="size-3" aria-hidden /> : null}
            </span>

            <div className="flex min-w-0 flex-col gap-1.5">
              <p
                className={cn(
                  "text-body-sm font-medium",
                  module.done && "text-muted-foreground line-through"
                )}
              >
                {module.title}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="size-3" aria-hidden />
                  {module.weeks}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <LinkIcon className="size-3" aria-hidden />
                  {module.resource}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
