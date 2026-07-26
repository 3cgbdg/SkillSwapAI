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
import { ISession } from "@/types/session";
import { format, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";

function sessionStartsAt(session: ISession) {
  const start = new Date(session.date);
  start.setHours(session.start, 0, 0, 0);
  return start;
}

const Page = () => {
  const { data: sessions = [], isLoading } = useSessions();
  const now = new Date();

  const upcoming = sessions
    .filter((session) => sessionStartsAt(session) >= now)
    .sort(
      (a, b) => sessionStartsAt(a).getTime() - sessionStartsAt(b).getTime()
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
              const start = sessionStartsAt(session);
              const dayLabel = isToday(start)
                ? "Today"
                : format(start, "EEEE, MMM d");
              return (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>
                      {dayLabel} · {session.start}:00 – {session.end}:00
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    With {session.friend.name}
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
