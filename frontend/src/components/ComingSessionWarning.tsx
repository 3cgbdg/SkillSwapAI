"use client";

import { useAppSelector } from "@/hooks/reduxHooks";
import { ISession } from "@/types/types";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ComingSessionWarning = () => {
  const [upComingSession, setUpComingSession] = useState<ISession | null>(null);
  const { sessions } = useAppSelector((state) => state.sessions);
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
    console.log(upcoming);
    setUpComingSession(upcoming || null);
  }, [sessions]);

  return (
    <>
      {upComingSession && upComingSession.status !== "PENDING" && (
        <div className="fixed z-50 top-4 left-1/2 -translate-x-1/2 max-w-[500px] w-full">
          <div className="bg-lightBlue border border-blue rounded-2xl p-3 flex items-center gap-4 shadow-lg max-w-md">
            <div className="text-blue font-bold text-xl">
              <TriangleAlert />
            </div>
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 justify-between">
                <span className="font-semibold text-lg">
                  {upComingSession.title}
                </span>
                <span className="text-sm text-gray">
                  {new Date(upComingSession.date).toLocaleDateString()} |{" "}
                  {upComingSession.start}:00 - {upComingSession.end}:00
                </span>
              </div>
              {upComingSession.friend && (
                <span className="text-sm text-gray">
                  With: {upComingSession.friend.name}
                </span>
              )}
              {upComingSession.meetingLink && (
                <div className="flex items-center gap-1">
                  <span className="text-gray">Link: </span>
                  <Link
                    href={upComingSession.meetingLink}
                    className="text-sm mt-1 hover:underline"
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
