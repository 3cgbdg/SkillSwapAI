import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

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
          "flex items-center gap-2 rounded-md transition-colors hover:text-primary",
          done ? "text-muted-foreground" : "text-foreground"
        )}
      >
        <CheckCircle2
          className={cn(
            "size-4 shrink-0",
            done ? "text-success" : "text-border"
          )}
        />
        <span className={cn(done && "line-through")}>{label}</span>
      </Link>
    </li>
  );
}
