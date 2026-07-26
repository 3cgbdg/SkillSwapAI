import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MatchProgressPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "col-span-3 flex h-[254px] items-center justify-center p-6 text-center sm:col-span-1 xl:col-span-2",
        className
      )}
    >
      <CardContent className="flex flex-col items-center gap-4 p-0">
        {children}
      </CardContent>
    </Card>
  );
}
