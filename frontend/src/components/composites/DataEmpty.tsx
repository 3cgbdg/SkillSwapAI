import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { WarmScholarEmptyArt } from "@/components/illustrations/WarmScholarEmptyArt";
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
  illustration,
  title,
  description,
  action,
  children,
  className,
}: {
  icon?: LucideIcon;
  /** Defaults to true only when no icon is given — pass explicitly to show
   * the mascot alongside/instead of an icon you've also provided. */
  illustration?: boolean;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const showIllustration = illustration ?? !Icon;
  return (
    <Empty className={cn("bg-muted/30", className)}>
      <EmptyHeader>
        {showIllustration ? (
          <WarmScholarEmptyArt className="text-primary h-16 w-24" />
        ) : Icon ? (
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
