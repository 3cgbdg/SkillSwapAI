import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function QuickLinkTile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card elevation="interactive">
        <CardContent className="flex flex-col items-center gap-2 py-5">
          <Icon className="text-brand-accent size-8" />
          <span className="text-body-sm font-semibold">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
