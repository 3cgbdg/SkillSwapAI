"use client";

import { memo } from "react";
import { format } from "date-fns";
import Link from "next/link";

import { TableCellType } from "./Calendar";
import { resolveSessionColor } from "@/utils/sessionColors";
import { formatSessionTimeRange } from "@/utils/sessionTime";

const TouchScreenCalendar = ({
  tableCells,
}: {
  tableCells: TableCellType[];
}) => {
  return (
    <div className="flex flex-col gap-6 p-4">
      {tableCells.map((cell) => (
        <div key={cell.date.toISOString()} className="flex flex-col gap-2">
          <div className="text-muted-foreground text-xs font-semibold uppercase">
            {format(cell.date, "EEEE, MMMM d")}
          </div>
          <div className="flex flex-col gap-2">
            {cell.sessions.length !== 0 ? (
              cell.sessions.map((session) => {
                const colors = resolveSessionColor(session.color);
                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-1 rounded-lg border border-border p-3"
                    style={{
                      backgroundColor: colors.backgroundColor,
                      color: colors.color,
                    }}
                  >
                    <p className="text-xs font-medium">
                      {formatSessionTimeRange(session.startsAt, session.endsAt)}
                    </p>
                    <h2 className="text-foreground text-sm font-semibold">
                      {session.title}
                    </h2>
                    <div>
                      {session.description ? (
                        <div className="border-border/60 my-1 border-y py-1">
                          <p className="text-xs leading-4 opacity-90">
                            {session.description}
                          </p>
                        </div>
                      ) : null}
                      {session.meetingLink ? (
                        <p className="text-xs leading-4">
                          <Link
                            href={session.meetingLink}
                            className="font-medium underline-offset-2 hover:underline"
                          >
                            Join meeting
                          </Link>
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-muted text-muted-foreground rounded-md border border-border p-2 text-xs">
                No events scheduled for this day.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(TouchScreenCalendar);
