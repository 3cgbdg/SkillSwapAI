"use client";

import useProfile from "@/hooks/useProfile";
import useMatches from "@/hooks/useMatches";
import useSessions from "@/hooks/useSessions";
import {
  Award,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

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
    .filter((s) => {
      const startDate = new Date(s.date);
      startDate.setHours(s.start, 0, 0, 0);
      return now <= startDate;
    })
    .slice(0, 3);

  const topMatches = [...matches]
    .sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
    .slice(0, 3);

  const showStats =
    (user?.completedSessionsCount ?? 0) > 0 ||
    knownCount > 0 ||
    matches.length > 0;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {needsOnboarding ? <OnboardingWizard /> : null}

      <Card elevation="raised" className="border-0 bg-surface-raised">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          {loading ? (
            <div className="flex w-full flex-col gap-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
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
                  <span className="text-primary font-semibold">
                    {completeness}%
                  </span>
                </div>
                <Progress value={completeness} />
                <ul className="mt-1 flex flex-col gap-1.5 text-sm">
                  <TaskRow
                    done={knownCount > 0}
                    label="Add a skill you can teach"
                    href="/profile"
                  />
                  <TaskRow
                    done={learnCount > 0}
                    label="Add a skill you want to learn"
                    href="/profile"
                  />
                  <TaskRow
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

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-h2">Recommended matches</h2>
          <Link
            href="/matches"
            className="text-primary text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
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
                      <CardDescription>
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
          <EmptyState
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
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-h2">Today&apos;s sessions</h2>
        {sessionsLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : upcoming.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcoming.map((item) => (
              <Card key={item.id} elevation="raised">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Calendar className="text-primary size-5 shrink-0" />
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>
                      {item.start}:00 – {item.end}:00
                      {item.friend?.name ? ` · with ${item.friend.name}` : ""}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
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
      </section>

      {showStats ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-h2">Your progress</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatPill icon={Award} value={knownCount} label="Skills" />
            <StatPill
              icon={Star}
              value={user?.completedSessionsCount ?? 0}
              label="Sessions"
            />
            <StatPill icon={Users} value={matches.length} label="Matches" />
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-h2">Quick access</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickLink href="/profile" icon={User} label="My Profile" />
          <QuickLink href="/matches" icon={Users} label="Matches" />
          <QuickLink href="/chats" icon={MessageSquare} label="Chat" />
          <QuickLink href="/calendar" icon={Calendar} label="Calendar" />
        </div>
      </section>
    </div>
  );
};

function TaskRow({
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

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Award;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2">
      <Icon className="text-primary size-4 shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-none">{value}</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </div>
  );
}

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
