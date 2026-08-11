import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatTile({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2",
        className
      )}
    >
      <Icon className="text-primary size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-none tabular-nums">
          {value}
        </div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </div>
  );
}
