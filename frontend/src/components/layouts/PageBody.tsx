import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-(--space-section) animate-fade-up",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageSection({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-(--space-stack)", className)}>
      {title != null || action != null ? (
        <div className="flex items-end justify-between gap-4">
          {title != null ? (
            <h2 className="font-heading text-h2">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
