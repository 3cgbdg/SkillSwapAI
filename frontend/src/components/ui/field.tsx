import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  description,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;
  const descriptionId =
    description && htmlFor ? `${htmlFor}-description` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="text-body-sm font-medium">
          {label}
        </Label>
      ) : null}
      {children}
      {description ? (
        <p id={descriptionId} className="text-muted-foreground text-xs">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-destructive text-body-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
