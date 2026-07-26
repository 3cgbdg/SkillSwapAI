"use client";

import type { ReactNode } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

export function SplitPane({
  left,
  right,
  defaultLeftPercent = 32,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  defaultLeftPercent?: number;
  className?: string;
}) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className={cn("min-h-[min(75dvh,800px)] w-full", className)}
    >
      <ResizablePanel defaultSize={defaultLeftPercent} minSize={20}>
        {left}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultLeftPercent} minSize={30}>
        {right}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
