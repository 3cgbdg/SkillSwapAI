"use client";

import { memo } from "react";
import { format } from "date-fns";
import { TableCellType } from "./Calendar";
import Link from "next/link";

const TouchScreenCalendar = ({
  tableCells,
}: {
  tableCells: TableCellType[];
}) => {
  return (
    <div className="flex flex-col gap-6 p-4">
      {tableCells.map((cell) => (
        <div key={cell.date.toISOString()} className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase leading-4 text-muted-foreground">
            {format(cell.date, "EEEE")}, {format(cell.date, "MMMM")}{" "}
            {format(cell.date, "d")}
          </div>
          <div className="flex flex-col gap-2">
            {cell.sessions.length !== 0 ? (
              cell.sessions.map((session) => (
                <div
                  key={session.id}
                  style={{ borderColor: session.color }}
                  className="flex flex-col gap-1 rounded-[10px] border border-border p-2"
                >
                  <p className="text-xs font-medium leading-4 text-primary">
                    {session.start}:00 - {session.end}:00
                  </p>
                  <h2 className="text-sm font-medium leading-5">
                    {session.title}
                  </h2>
                  <div>
                    {session.description && (
                      <div className="my-1 border-y border-border p-1">
                        <h3 className="font-medium text-foreground">
                          Description
                        </h3>
                        <p className="text-xs leading-4 text-muted-foreground">
                          {session.description}
                        </p>
                      </div>
                    )}
                    {session.meetingLink && (
                      <p className="text-xs leading-4 text-muted-foreground">
                        Meeting Link:{" "}
                        <Link
                          href={session.meetingLink}
                          className="font-medium text-foreground hover:underline"
                        >
                          {session.meetingLink}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-border bg-muted p-2 text-xs leading-4 text-muted-foreground">
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
