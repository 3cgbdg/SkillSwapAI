"use client";

import type { ComponentProps, ReactNode } from "react";

import { Popover, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const floatingPanelSurfaceClass =
  "bg-popover text-popover-foreground z-[var(--z-dropdown)] flex flex-col overflow-auto shadow-md ring-1 ring-foreground/10";

export function FloatingPanelSurface({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn(floatingPanelSurfaceClass, className)} {...props}>
      {children}
    </div>
  );
}

export function FloatingPanel({
  children,
  className,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      align={align}
      side={side}
      sideOffset={sideOffset}
      className={cn("max-h-80 w-80 overflow-y-auto p-0", className)}
      {...props}
    >
      {children as ReactNode}
    </PopoverContent>
  );
}

export function FloatingPanelRoot({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {children}
    </Popover>
  );
}
