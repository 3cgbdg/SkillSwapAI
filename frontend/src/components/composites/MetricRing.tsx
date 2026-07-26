import { cn } from "@/lib/utils";

export function MetricRing({
  value,
  label,
  className,
  size = "md",
}: {
  value: number;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-9 text-[10px]" : "size-11 text-xs";

  return (
    <div
      className={cn(
        "border-primary/30 bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-full border font-bold tabular-nums",
        dim,
        className
      )}
      aria-label={label ?? `${value}%`}
    >
      {value}%
    </div>
  );
}
