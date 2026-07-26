"use client";

import { memo, useState } from "react";
import { format } from "date-fns";
import { TableCellType } from "./Calendar";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionDetails } from "./SessionDetails";

const DesktopGridCalendar = ({
  tableCells,
}: {
  tableCells: TableCellType[];
}) => {
  const [details, setDetails] = useState<null | {
    descr?: string;
    meetingLink: string | null;
  }>(null);

  return (
    <div className="relative">
      {details !== null && (
        <SessionDetails
          details={details}
          onClose={() => setDetails(null)}
          className="absolute -top-20 left-10 z-50 max-h-[250px] min-w-[150px] max-w-[300px] overflow-auto p-2"
        />
      )}
      <div className="grid grid-cols-8 border-b border-border pr-[15px]">
        <div className="flex flex-col items-center gap-0.5 border-neutral-300 not-last:border-r" />
        {tableCells.map((cell, idx) => (
          <div className="flex flex-col items-center gap-0.5" key={idx}>
            <span className="text-sm leading-5 font-medium">
              {format(cell.date, "E")}
            </span>
            <span className="text-lg leading-7 font-bold">
              {format(cell.date, "d")}
            </span>
          </div>
        ))}
      </div>
      <div className="relative grid h-[440px] grid-cols-8 overflow-y-auto">
        <div className="border-r border-border">
          {Array.from(
            { length: 24 },
            (_, i) => `${i.toString().padStart(2, "0")}:00`
          ).map((value, idx) => (
            <div
              key={idx}
              className="flex min-h-[100px] items-center justify-center text-sm leading-4 text-muted-foreground"
            >
              {value}
            </div>
          ))}
        </div>

        <div className="relative col-span-7 grid grid-cols-7">
          {tableCells.map((cell) => (
            <div
              key={cell.date.toISOString()}
              className="grid border border-border p-1"
              style={{ gridTemplateRows: "repeat(24, 100px)" }}
            >
              {cell.sessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    backgroundColor: session.color,
                    gridRowStart: session.start + 1,
                    gridRowEnd: session.end === 0 ? 25 : session.end + 1,
                  }}
                  className="relative flex w-full flex-col gap-1 rounded border border-border/50 p-2 text-xs font-semibold text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="wrap-anywhere">{session.title}</span>
                    {session.description != null && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-white hover:bg-white/20"
                        onClick={() =>
                          setDetails({
                            descr: session.description,
                            meetingLink: session.meetingLink,
                          })
                        }
                        aria-label="View session description"
                      >
                        <ReceiptText size={16} />
                      </Button>
                    )}
                  </div>
                  <span>
                    ({session.start} - {session.end})
                  </span>
                  <span>
                    Status: {session.status == "PENDING" ? "Pending" : "Agreed"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(DesktopGridCalendar);
