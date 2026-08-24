import { Check, Clock, Link as LinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    title: "TypeScript foundations",
    weeks: "Week 1",
    resource: "Types, interfaces, and a guided refactor",
    done: true,
  },
  {
    title: "Reusable React patterns",
    weeks: "Week 2",
    resource: "Props, state, and typed composition",
    done: true,
  },
  {
    title: "Data and API boundaries",
    weeks: "Week 3",
    resource: "Query layer and error-state exercise",
    done: false,
  },
  {
    title: "Ship a real feature together",
    weeks: "Week 4",
    resource: "Pair review, polish, and reflection",
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
      aria-label="A four-week AI-generated TypeScript learning journey with two modules complete, each listing a timeline and a suggested resource."
      className={cn("w-full max-w-md", className)}
    >
      <CardHeader bordered className="gap-1">
        <CardTitle className="text-lg">TypeScript learning journey</CardTitle>
        <p className="text-muted-foreground text-body-sm">
          Generated for you and Maya · 50% complete
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
