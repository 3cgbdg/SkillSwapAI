import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-(--content-max) px-(--page-gutter) md:px-[calc(var(--page-gutter)*1.5)]",
        className
      )}
    >
      {children}
    </div>
  );
}
