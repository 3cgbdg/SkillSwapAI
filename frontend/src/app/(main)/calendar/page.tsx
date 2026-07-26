"use client";

import { Suspense } from "react";

import Calendar from "@/components/calendar/Calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import useSessions from "@/hooks/useSessions";
import { format, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";

import { formatSessionTimeRange, sessionStartDate } from "@/utils/sessionTime";

const Page = () => {
  const { data: sessions = [], isLoading } = useSessions();
  const now = new Date();

  const upcoming = sessions
    .filter((session) => sessionStartDate(session) >= now)
    .sort(
      (a, b) => sessionStartDate(a).getTime() - sessionStartDate(b).getTime()
    );

  return (
    <div className="flex flex-col gap-10">
      <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
        <Calendar />
      </Suspense>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold leading-8">Upcoming sessions</h2>
        {isLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : upcoming.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcoming.map((session) => {
              const start = sessionStartDate(session);
              const dayLabel = isToday(start)
                ? "Today"
                : format(start, "EEEE, MMM d");
              return (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>
                      {dayLabel} ·{" "}
                      {formatSessionTimeRange(session.startsAt, session.endsAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    With {session.friend?.name ?? "your partner"}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming sessions today"
            description="Create a session on the calendar or schedule one with a match."
          />
        )}
      </section>
    </div>
  );
};

export default Page;
