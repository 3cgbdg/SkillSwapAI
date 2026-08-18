"use client";

import { Suspense, useState } from "react";

import Calendar from "@/components/calendar/Calendar";
import { AsyncBoundary, DataEmpty, SkeletonKit } from "@/components/composites";
import { PageBody, PageHeader, PageSection } from "@/components/layouts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSessions from "@/hooks/useSessions";
import { useReviewableSessions } from "@/hooks/useReviews";
import { format, isToday } from "date-fns";
import { CalendarDays, Star } from "lucide-react";
import { RateSessionDialog } from "@/components/reviews/RateSessionDialog";

import { formatSessionTimeRange, sessionStartDate } from "@/utils/sessionTime";

const Page = () => {
  const { data: sessions = [], isLoading, isError, error } = useSessions();
  const { data: reviewableSessions = [] } = useReviewableSessions();
  const [ratingSessionId, setRatingSessionId] = useState<string | null>(null);
  const now = new Date();

  const upcoming = sessions
    .filter((session) => sessionStartDate(session) >= now)
    .sort(
      (a, b) => sessionStartDate(a).getTime() - sessionStartDate(b).getTime()
    );

  const ratingSession = reviewableSessions.find(
    (s) => s.id === ratingSessionId
  );

  return (
    <PageBody>
      <PageHeader title="Schedule" />

      <Suspense fallback={<SkeletonKit.CalendarWeekFallback />}>
        <Calendar />
      </Suspense>

      <PageSection title="Upcoming sessions">
        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          loadingFallback={<SkeletonKit.CardGrid count={2} />}
        >
          {upcoming.length === 0 ? (
            <DataEmpty
              icon={CalendarDays}
              title="No upcoming sessions"
              description="Schedule a session with a learning partner from your matches or inbox."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>
                      {isToday(sessionStartDate(session))
                        ? "Today"
                        : format(sessionStartDate(session), "EEEE, MMM d")}
                      {" · "}
                      {formatSessionTimeRange(session.startsAt, session.endsAt)}
                    </CardDescription>
                  </CardHeader>
                  {session.description ? (
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {session.description}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </AsyncBoundary>
      </PageSection>

      {reviewableSessions.length > 0 ? (
        <PageSection title="Past sessions to rate">
          <div className="grid gap-4 md:grid-cols-2">
            {reviewableSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>
                    {format(sessionStartDate(session), "EEEE, MMM d")}
                    {session.friend?.name
                      ? ` · with ${session.friend.name}`
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setRatingSessionId(session.id)}
                  >
                    <Star size={16} />
                    Rate this session
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </PageSection>
      ) : null}

      {ratingSession ? (
        <RateSessionDialog
          open={Boolean(ratingSessionId)}
          onOpenChange={(open) => {
            if (!open) setRatingSessionId(null);
          }}
          sessionId={ratingSession.id}
          sessionTitle={ratingSession.title}
          friendName={ratingSession.friend?.name}
        />
      ) : null}
    </PageBody>
  );
};

export default Page;
