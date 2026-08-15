import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  illustration,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        {illustration ? <div className="shrink-0">{illustration}</div> : null}
        <div className="flex min-w-0 flex-col gap-2">
          {eyebrow ? (
            <p className="text-muted-foreground text-body-sm">{eyebrow}</p>
          ) : null}
          {title ? (
            <h1 className="font-heading text-h1 text-foreground">{title}</h1>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-body-sm">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
