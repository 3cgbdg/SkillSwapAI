import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function TaskChecklistLink({
  done,
  label,
  href,
}: {
  done: boolean;
  label: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "-mx-2 flex min-h-10 items-center gap-3 rounded-lg px-2 transition-colors",
          done
            ? "text-muted-foreground hover:bg-muted/60"
            : "bg-primary/10 text-foreground hover:bg-primary/15"
        )}
      >
        <CheckCircle2
          className={cn(
            "size-4 shrink-0",
            done ? "text-success" : "text-border"
          )}
        />
        <span className="min-w-0 flex-1">{label}</span>
        {!done ? (
          <ChevronRight className="text-primary size-4 shrink-0" aria-hidden />
        ) : null}
      </Link>
    </li>
  );
}
