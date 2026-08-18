"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`${value} out of 5 stars`}
    >
      {STAR_VALUES.map((star) =>
        readOnly ? (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= value
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground"
            )}
            aria-hidden
          />
        ) : (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
            onClick={() => onChange?.(star)}
          >
            <Star
              className={cn(
                sizeClass,
                "transition-colors",
                star <= value
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground hover:text-primary"
              )}
            />
          </button>
        )
      )}
    </div>
  );
}
