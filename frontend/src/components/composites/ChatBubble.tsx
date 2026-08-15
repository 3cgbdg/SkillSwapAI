import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ChatBubble({
  isMine,
  failed,
  pending,
  children,
  className,
}: {
  isMine: boolean;
  failed?: boolean;
  pending?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl border px-3 py-2 text-body-sm",
        isMine
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-surface-raised text-foreground",
        failed && "ring-2 ring-destructive/50",
        pending && "opacity-80",
        className
      )}
    >
      {children}
    </div>
  );
}
