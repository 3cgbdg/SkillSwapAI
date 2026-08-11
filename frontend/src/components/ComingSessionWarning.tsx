"use client";

import useSessions from "@/hooks/useSessions";
import { ISession } from "@/types/session";
import { TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatSessionDay, formatSessionTimeRange } from "@/utils/sessionTime";

const DISMISS_KEY = "skillswap:dismissed-session-warning";

const ComingSessionWarning = () => {
  const [upComingSession, setUpComingSession] = useState<ISession | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const { data: sessions = [] } = useSessions();

  useEffect(() => {
    try {
      setDismissedId(sessionStorage.getItem(DISMISS_KEY));
    } catch {
      setDismissedId(null);
    }
  }, []);

  useEffect(() => {
    if (!sessions || sessions.length === 0) return;
    const now = new Date();
    const upcoming = sessions.find((item) => {
      const sessionStart = new Date(item.startsAt);
      const sessionEnd = new Date(item.endsAt);
      const sessionStartHourBefore = new Date(sessionStart);
      sessionStartHourBefore.setHours(sessionStart.getHours() - 1);

      return (
        (now >= sessionStartHourBefore && now <= sessionEnd) ||
        (now >= sessionStart && now <= sessionEnd)
      );
    });

    setUpComingSession(upcoming || null);
  }, [sessions]);

  const dismiss = () => {
    if (!upComingSession) return;
    try {
      sessionStorage.setItem(DISMISS_KEY, upComingSession.id);
    } catch {
      /* ignore */
    }
    setDismissedId(upComingSession.id);
  };

  if (
    !upComingSession ||
    upComingSession.status === "PENDING" ||
    dismissedId === upComingSession.id
  ) {
    return null;
  }

  return (
    <div className="fixed top-(--header-h) left-1/2 z-[var(--z-overlay)] w-full max-w-[500px] -translate-x-1/2 px-4 md:top-4">
      <div className="border-border bg-surface-raised animate-fade-up flex max-w-md items-start gap-3 rounded-2xl border p-3 shadow-lg">
        <div className="text-primary mt-0.5 shrink-0">
          <TriangleAlert aria-hidden />
        </div>
        <div className="flex w-full min-w-0 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-semibold leading-tight">
              {upComingSession.title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={dismiss}
              aria-label="Dismiss session warning"
            >
              <X />
            </Button>
          </div>
          <span className="text-muted-foreground text-sm">
            {formatSessionDay(upComingSession.startsAt)} |{" "}
            {formatSessionTimeRange(
              upComingSession.startsAt,
              upComingSession.endsAt
            )}
          </span>
          {upComingSession.friend ? (
            <span className="text-muted-foreground text-sm">
              With: {upComingSession.friend.name}
            </span>
          ) : null}
          {upComingSession.meetingLink ? (
            <Link
              href={upComingSession.meetingLink}
              className="text-primary mt-1 truncate text-sm hover:underline"
            >
              Join meeting
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ComingSessionWarning;
