"use client";

import useSessions from "@/hooks/useSessions";
import { ISession } from "@/types/session";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ComingSessionWarning = () => {
  const [upComingSession, setUpComingSession] = useState<ISession | null>(null);
  const { data: sessions = [] } = useSessions();
  useEffect(() => {
    if (!sessions || sessions.length === 0) return;
    const now = new Date();
    const upcoming = sessions.find((item) => {
      const sessionDate = new Date(item.date);
      const sessionStartHourBefore = new Date(sessionDate);
      sessionStartHourBefore.setHours(item.start - 1, 0, 0, 0);
      const sessionStart = new Date(sessionDate);
      sessionStart.setHours(item.start, 0, 0, 0);
      const sessionEnd = new Date(
        sessionStart.getTime() + 60 * (item.end - item.start) * 60 * 1000
      );

      return (
        (now >= sessionStartHourBefore && now <= sessionEnd) ||
        (now >= sessionStart && now <= sessionEnd)
      );
    });

    setUpComingSession(upcoming || null);
  }, [sessions]);

  return (
    <>
      {upComingSession && upComingSession.status !== "PENDING" && (
        <div
          className="fixed left-1/2 top-4 z-[var(--z-toast)] w-full max-w-[500px] -translate-x-1/2 px-4"
          style={{ zIndex: "var(--z-toast)" }}
        >
          <div className="flex max-w-md items-center gap-4 rounded-2xl border border-border bg-surface-raised p-3 shadow-lg">
            <div className="text-xl font-bold text-primary">
              <TriangleAlert />
            </div>
            <div className="flex w-full flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-semibold">
                  {upComingSession.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(upComingSession.date).toLocaleDateString()} |{" "}
                  {upComingSession.start}:00 - {upComingSession.end}:00
                </span>
              </div>
              {upComingSession.friend && (
                <span className="text-sm text-muted-foreground">
                  With: {upComingSession.friend.name}
                </span>
              )}
              {upComingSession.meetingLink && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Link: </span>
                  <Link
                    href={upComingSession.meetingLink}
                    className="mt-1 text-sm hover:underline"
                  >
                    {upComingSession.meetingLink}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComingSessionWarning;
