import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const TONE_ICON_CLASS = {
  default: "text-primary",
  teach: "text-accent-teach",
  learn: "text-accent-learn",
} as const;

export function StatTile({
  icon: Icon,
  value,
  label,
  tone = "default",
  className,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  tone?: "default" | "teach" | "learn";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2",
        className
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", TONE_ICON_CLASS[tone])}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-none tabular-nums">
          {value}
        </div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </div>
  );
}
