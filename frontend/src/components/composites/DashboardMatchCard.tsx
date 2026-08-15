import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SwapAxis } from "@/components/composites/SwapAxis";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { IMatch } from "@/types/match";

export function DashboardMatchCard({
  match,
  href,
}: {
  match: IMatch;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      aria-label={`View match with ${match.other.name}`}
    >
      <Card elevation="interactive" className="h-full">
        <CardHeader className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <UserAvatar
            name={match.other.name}
            imageUrl={match.other.imageUrl}
            size="md"
          />
          <div className="min-w-0">
            <CardTitle className="truncate">{match.other.name}</CardTitle>
            <CardDescription>Potential skill-swap partner</CardDescription>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {match.compatibility ?? 0}% match
          </Badge>
        </CardHeader>
        <CardContent className="flex grow flex-col gap-4">
          <SwapAxis
            teach={match.other.knownSkills}
            learn={match.other.skillsToLearn}
            teachLabel="They teach"
            learnLabel="They want to learn"
            max={2}
          />
          {match.aiExplanation ? (
            <p className="text-muted-foreground line-clamp-2 text-body-sm">
              {match.aiExplanation}
            </p>
          ) : null}
          <span className="text-primary mt-auto inline-flex items-center gap-1 text-body-sm font-semibold">
            View match
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
