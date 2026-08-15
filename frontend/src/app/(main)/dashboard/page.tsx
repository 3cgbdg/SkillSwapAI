"use client";

import { Award, BookOpen, Calendar, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";

import {
  DashboardMatchCard,
  DataEmpty,
  SectionPanel,
  SkeletonKit,
  StatTile,
  TaskChecklistLink,
} from "@/components/composites";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { PageBody, PageHeader, PageSection } from "@/components/layouts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useMatches from "@/hooks/useMatches";
import useProfile from "@/hooks/useProfile";
import useSessions from "@/hooks/useSessions";
import { formatSessionTimeRange } from "@/utils/sessionTime";

const DashboardPage = () => {
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
    .filter((session) => new Date(session.startsAt) >= now)
    .slice(0, 2);

  const topMatches = [...matches]
    .sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
    .slice(0, 2);

  const showStats =
    (user?.completedSessionsCount ?? 0) > 0 ||
    knownCount > 0 ||
    learnCount > 0 ||
    matches.length > 0;

  const welcomeName = user?.name?.trim();

  return (
    <PageBody>
      {loading ? (
        <SkeletonKit.PageHeader />
      ) : (
        <PageHeader
          eyebrow={
            welcomeName ? `Welcome back, ${welcomeName}` : "Welcome back"
          }
          title="Keep your learning moving"
          description="Continue with your next session or meet someone who can help you learn."
          actions={
            <Link href="/matches" className={buttonVariants({ size: "lg" })}>
              <Sparkles className="size-4" aria-hidden />
              Find a partner
            </Link>
          }
        />
      )}

      {needsOnboarding ? <OnboardingWizard /> : null}

      <div className="grid items-start gap-(--space-section) lg:grid-cols-3">
        <PageSection
          title="Next up"
          className="lg:col-span-2"
          action={
            <Link
              href="/schedule"
              className="text-primary text-body-sm font-semibold hover:underline"
            >
              View schedule
            </Link>
          }
        >
          {sessionsLoading ? (
            <SkeletonKit.Row />
          ) : upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcoming.map((session) => (
                <Card key={session.id} elevation="raised" size="sm">
                  <CardContent className="flex items-center gap-4">
                    <Calendar
                      className="text-primary size-5 shrink-0"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading font-semibold">
                        {session.title}
                      </p>
                      <p className="text-muted-foreground text-body-sm">
                        {formatSessionTimeRange(
                          session.startsAt,
                          session.endsAt
                        )}
                        {session.friend?.name
                          ? ` · with ${session.friend.name}`
                          : ""}
                      </p>
                    </div>
                    <Badge variant="status" className="hidden sm:inline-flex">
                      {session.status === "AGREED" ? "Confirmed" : "Pending"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <DataEmpty
              icon={Calendar}
              illustration={false}
              title="Nothing scheduled yet"
              description="Turn a promising match into a focused learning session."
              action={
                <Link href="/schedule" className={buttonVariants()}>
                  Schedule a session
                </Link>
              }
            />
          )}
        </PageSection>

        {profileLoading ? (
          <SkeletonKit.Row />
        ) : (
          <SectionPanel
            title="Profile strength"
            description="A complete profile makes every recommendation more useful."
            elevation="raised"
            footer={
              <Link
                href="/profile"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Manage profile
              </Link>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-body-sm">
                <span className="font-medium">Profile complete</span>
                <span className="text-primary font-semibold tabular-nums">
                  {completeness}%
                </span>
              </div>
              <Progress
                value={completeness}
                aria-label={`Profile ${completeness}% complete`}
              />
              <ul className="flex flex-col gap-2 text-body-sm">
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
        )}
      </div>

      <PageSection
        title="Recommended partners"
        action={
          <Link
            href="/matches"
            className="text-primary text-body-sm font-semibold hover:underline"
          >
            View all matches
          </Link>
        }
      >
        {loading ? (
          <SkeletonKit.CardGrid />
        ) : topMatches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {topMatches.map((match, index) => (
              <div
                key={match.id ?? match.other.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <DashboardMatchCard
                  match={match}
                  href={
                    match.id
                      ? `/matches/${match.id}`
                      : `/profiles/${match.other.id}`
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <DataEmpty
            icon={Sparkles}
            title="No partners to recommend yet"
            description="Tell us what you can teach and what you want to learn, and we’ll look for a two-way fit."
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
    </PageBody>
  );
};

export default DashboardPage;
