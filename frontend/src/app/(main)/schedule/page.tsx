"use client";

import { Suspense } from "react";

import Calendar from "@/components/calendar/Calendar";
import { AsyncBoundary, EmptyState } from "@/components/composites";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkeletonKit } from "@/components/composites";
import useSessions from "@/hooks/useSessions";
import { format, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";

import { formatSessionTimeRange, sessionStartDate } from "@/utils/sessionTime";

const Page = () => {
  const { data: sessions = [], isLoading, isError, error } = useSessions();
  const now = new Date();

  const upcoming = sessions
    .filter((session) => sessionStartDate(session) >= now)
    .sort(
      (a, b) => sessionStartDate(a).getTime() - sessionStartDate(b).getTime()
    );

  return (
    <div className="flex flex-col gap-10">
      <Suspense fallback={<SkeletonKit.CalendarWeekFallback />}>
        <Calendar />
      </Suspense>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold leading-8">Upcoming sessions</h2>
        <AsyncBoundary isLoading={isLoading} isError={isError} error={error}>
          {upcoming.length === 0 ? (
            <EmptyState
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
      </section>
    </div>
  );
};

export default Page;
