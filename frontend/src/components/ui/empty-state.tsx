import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center",
        className
      )}
    >
      {Icon ? (
        <Icon className="text-muted-foreground size-10" aria-hidden />
      ) : null}
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="text-muted-foreground max-w-md text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
