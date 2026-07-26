"use client";

import useProfile from "@/hooks/useProfile";
import useMatches from "@/hooks/useMatches";
import useSessions from "@/hooks/useSessions";
import {
  Award,
  Calendar,
  MessageSquare,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import {
  DataEmpty,
  SkeletonKit,
  StatTile,
  TaskChecklistLink,
} from "@/components/composites";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { PageBody, PageSection } from "@/components/layouts";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatSessionTimeRange } from "@/utils/sessionTime";

const Page = () => {
  const { data: user, isLoading: profileLoading } = useProfile();
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const now = new Date();
  const loading = profileLoading || matchesLoading;

  const knownCount = user?.knownSkills?.length ?? 0;
  const learnCount = user?.skillsToLearn?.length ?? 0;
  const hasBio = Boolean(user?.bio?.trim());
  const completeness = Math.round(
    ((knownCount > 0 ? 1 : 0) + (learnCount > 0 ? 1 : 0) + (hasBio ? 1 : 0)) *
      (100 / 3)
  );
  const needsOnboarding = !loading && (knownCount === 0 || learnCount === 0);

  const upcoming = sessions
    .filter((s) => new Date(s.startsAt) >= now)
    .slice(0, 3);

  const topMatches = [...matches]
    .sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
    .slice(0, 3);

  const showStats =
    (user?.completedSessionsCount ?? 0) > 0 ||
    knownCount > 0 ||
    matches.length > 0;

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7877/ingest/c055a23c-4c84-4eb5-84c0-8abae4e46ddd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ee6149",
      },
      body: JSON.stringify({
        sessionId: "ee6149",
        hypothesisId: "H4",
        location: "dashboard/page.tsx",
        message: "dashboard aggregate state",
        data: {
          profileLoading,
          matchesLoading,
          sessionsLoading,
          hasUser: Boolean(user),
          knownCount,
          learnCount,
          completedSessionsCount: user?.completedSessionsCount ?? null,
          matchesLen: matches.length,
          sessionsLen: sessions.length,
          showStats,
          apiBase:
            typeof process.env.NEXT_PUBLIC_API_URL === "string"
              ? process.env.NEXT_PUBLIC_API_URL.slice(0, 40)
              : "missing",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [
    profileLoading,
    matchesLoading,
    sessionsLoading,
    user,
    knownCount,
    learnCount,
    matches.length,
    sessions.length,
    showStats,
  ]);

  return (
    <PageBody>
      {needsOnboarding ? <OnboardingWizard /> : null}

      <Card elevation="raised" className="border-0 bg-surface-raised">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          {loading ? (
            <SkeletonKit.PageHeader />
          ) : (
            <>
              <div className="flex max-w-xl flex-col gap-3">
                <p className="text-muted-foreground text-sm">Welcome back</p>
                <h1 className="font-heading text-h1 text-foreground">
                  {user?.name ?? "there"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {needsOnboarding
                    ? "Finish setting up your skills to unlock better matches."
                    : "Pick a next step below — your learning loop continues here."}
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Profile completeness</span>
                  <span className="text-primary font-semibold tabular-nums">
                    {completeness}%
                  </span>
                </div>
                <Progress value={completeness} />
                <ul className="mt-1 flex flex-col gap-1.5 text-sm">
                  <TaskChecklistLink
                    done={knownCount > 0}
                    label="Add a skill you can teach"
                    href="/profile"
                  />
                  <TaskChecklistLink
                    done={learnCount > 0}
                    label="Add a skill you want to learn"
                    href="/profile"
                  />
                  <TaskChecklistLink
                    done={hasBio}
                    label="Write a short bio"
                    href="/profile"
                  />
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PageSection
        title="Recommended matches"
        action={
          <Link
            href="/matches"
            className="text-primary text-sm font-medium hover:underline"
          >
            View all
          </Link>
        }
      >
        {loading ? (
          <SkeletonKit.CardGrid />
        ) : topMatches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {topMatches.map((match, index) => (
              <Link
                key={match.id ?? match.other.id}
                href={
                  match.id
                    ? `/matches/${match.id}`
                    : `/profiles/${match.other.id}`
                }
                className="animate-fade-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Card elevation="interactive" className="h-full">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <UserAvatar
                      name={match.other.name}
                      imageUrl={match.other.imageUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate">
                        {match.other.name}
                      </CardTitle>
                      <CardDescription className="tabular-nums">
                        {match.compatibility ?? 0}% match
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {match.aiExplanation ||
                        `${match.other.knownSkills?.[0]?.title ?? "Skills"} ↔ ${match.other.skillsToLearn?.[0]?.title ?? "learning"}`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <DataEmpty
            icon={Sparkles}
            title="No matches yet"
            description="Add skills you teach and want to learn — then we’ll find partners for you."
            action={
              <Link
                href="/profile"
                className={buttonVariants({ variant: "outline" })}
              >
                Complete your profile
              </Link>
            }
          />
        )}
      </PageSection>

      <PageSection title="Today's sessions">
        {sessionsLoading ? (
          <SkeletonKit.Row />
        ) : upcoming.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcoming.map((item) => (
              <Card key={item.id} elevation="raised">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Calendar className="text-primary size-5 shrink-0" />
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>
                      {formatSessionTimeRange(item.startsAt, item.endsAt)}
                      {item.friend?.name ? ` · with ${item.friend.name}` : ""}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <DataEmpty
            icon={Calendar}
            title="No upcoming sessions"
            description="Schedule a session with a match to see it on your timeline."
            action={
              <Link
                href="/calendar"
                className={buttonVariants({ variant: "outline" })}
              >
                Open calendar
              </Link>
            }
          />
        )}
      </PageSection>

      {showStats ? (
        <PageSection title="Your progress">
          <div className="grid grid-cols-3 gap-3">
            <StatTile icon={Award} value={knownCount} label="Skills" />
            <StatTile
              icon={Star}
              value={user?.completedSessionsCount ?? 0}
              label="Sessions"
            />
            <StatTile icon={Users} value={matches.length} label="Matches" />
          </div>
        </PageSection>
      ) : null}

      <PageSection title="Quick access">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickLink href="/profile" icon={User} label="My Profile" />
          <QuickLink href="/matches" icon={Users} label="Matches" />
          <QuickLink href="/inbox" icon={MessageSquare} label="Chat" />
          <QuickLink href="/calendar" icon={Calendar} label="Calendar" />
        </div>
      </PageSection>
    </PageBody>
  );
};

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof User;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card elevation="interactive">
        <CardContent className="flex flex-col items-center gap-2 py-5">
          <Icon className="text-brand-accent size-8" />
          <span className="text-sm font-semibold">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default Page;
