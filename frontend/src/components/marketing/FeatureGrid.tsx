import type { LucideIcon } from "lucide-react";

import { HIGHLIGHTS } from "@/components/marketing/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card elevation="raised" className="h-full">
      <CardHeader className="gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <CardTitle className="text-h3">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-body-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

export function FeatureGrid() {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {HIGHLIGHTS.map(({ icon, title, description }) => (
        <li key={title}>
          <FeatureCard icon={icon} title={title} description={description} />
        </li>
      ))}
    </ul>
  );
}
