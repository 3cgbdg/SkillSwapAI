"use client";

import useProfile from "@/hooks/useProfile";
import useMatches from "@/hooks/useMatches";
import useSessions from "@/hooks/useSessions";
import {
  Award,
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

import {
  DataEmpty,
  QuickLinkTile,
  SectionPanel,
  SkeletonKit,
  StatTile,
  TaskChecklistLink,
} from "@/components/composites";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { PageBody, PageHeader, PageSection } from "@/components/layouts";
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
    learnCount > 0 ||
    matches.length > 0;

  return (
    <PageBody>
      {needsOnboarding ? <OnboardingWizard /> : null}

      {loading ? (
        <SkeletonKit.PageHeader />
      ) : (
        <>
          <PageHeader
            eyebrow="Welcome back"
            title={user?.name ?? "there"}
            description={
              needsOnboarding
                ? "Finish setting up your skills to unlock better matches."
                : "Pick a next step below — your learning loop continues here."
            }
          />
          <SectionPanel
            title="Profile completeness"
            elevation="raised"
            className="max-w-md"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-medium">Complete your profile</span>
                <span className="text-primary font-semibold tabular-nums">
                  {completeness}%
                </span>
              </div>
              <Progress value={completeness} />
              <ul className="mt-1 flex flex-col gap-4 text-body-sm">
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
          </SectionPanel>
        </>
      )}

      <PageSection
        title="Recommended matches"
        action={
          <Link
            href="/matches"
            className="text-primary text-body-sm font-medium hover:underline"
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
                  <CardHeader className="flex flex-row items-center gap-4">
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
                    <p className="text-muted-foreground line-clamp-2">
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
          <div className="flex flex-col gap-4">
            {upcoming.map((item) => (
              <Card key={item.id} elevation="raised">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
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
          <div className="grid grid-cols-2 gap-(--space-stack) sm:grid-cols-4">
            <StatTile
              icon={Award}
              value={knownCount}
              label="Can teach"
              tone="teach"
            />
            <StatTile
              icon={BookOpen}
              value={learnCount}
              label="Want to learn"
              tone="learn"
            />
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
        <div className="grid grid-cols-2 gap-(--space-stack) sm:grid-cols-4">
          <QuickLinkTile href="/profile" icon={User} label="My Profile" />
          <QuickLinkTile href="/matches" icon={Users} label="Matches" />
          <QuickLinkTile href="/inbox" icon={MessageSquare} label="Chat" />
          <QuickLinkTile href="/calendar" icon={Calendar} label="Calendar" />
        </div>
      </PageSection>
    </PageBody>
  );
};

export default Page;
