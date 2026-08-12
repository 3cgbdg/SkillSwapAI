import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export function DataEmpty({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Empty
      className={cn(
        "border-border bg-muted/30 border border-dashed",
        className
      )}
    >
      <EmptyHeader>
        {Icon ? (
          <EmptyMedia variant="icon">
            <Icon className="size-10" aria-hidden />
          </EmptyMedia>
        ) : null}
        <EmptyTitle className="text-lg font-semibold">{title}</EmptyTitle>
        {description ? (
          <EmptyDescription className="max-w-md">
            {description}
          </EmptyDescription>
        ) : null}
      </EmptyHeader>
      {children ? <EmptyContent>{children}</EmptyContent> : null}
      {action}
    </Empty>
  );
}
