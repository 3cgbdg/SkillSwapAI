import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-11",
} as const;

export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: keyof typeof sizeMap | number;
  className?: string;
  label?: string;
}) {
  const dimension =
    typeof size === "number" ? undefined : (sizeMap[size] ?? sizeMap.md);

  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn("text-primary animate-spin", dimension, className)}
      style={
        typeof size === "number" ? { width: size, height: size } : undefined
      }
    />
  );
}
