"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function DetailPane({
  title,
  children,
  open,
  onOpenChange,
  className,
  desktopClassName,
}: {
  title?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  desktopClassName?: string;
}) {
  const controlled = open !== undefined && onOpenChange !== undefined;

  const desktop = (
    <div
      className={cn(
        "hidden min-h-0 flex-1 md:flex md:flex-col",
        desktopClassName
      )}
    >
      {title ? <h2 className="text-h2 mb-4 shrink-0">{title}</h2> : null}
      <div className={cn("min-h-0 flex-1", className)}>{children}</div>
    </div>
  );

  if (!controlled) {
    return desktop;
  }

  return (
    <>
      {desktop}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="fixed inset-x-0 bottom-0 top-auto max-h-[85dvh] max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-xl md:hidden">
          {title ? (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          ) : null}
          <div className={cn("min-h-0 overflow-y-auto", className)}>
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
