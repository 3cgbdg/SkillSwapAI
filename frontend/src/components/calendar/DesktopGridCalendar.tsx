"use client";

import { format, isToday } from "date-fns";
import { ReceiptText } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SessionDetails } from "./SessionDetails";
import type { TableCellType } from "./Calendar";
import { resolveSessionColor } from "@/utils/sessionColors";
import { cn } from "@/lib/utils";

const WORK_START = 8;
const WORK_END = 22;

const DesktopGridCalendar = ({
  tableCells,
  onCreateSlot,
}: {
  tableCells: TableCellType[];
  onCreateSlot?: (startsAt: string, endsAt: string) => void;
}) => {
  const [showFullDay, setShowFullDay] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragDay, setDragDay] = useState<number | null>(null);
  const [dragStartHour, setDragStartHour] = useState<number | null>(null);

  const hourStart = showFullDay ? 0 : WORK_START;
  const hourEnd = showFullDay ? 24 : WORK_END;
  const hours = useMemo(
    () => Array.from({ length: hourEnd - hourStart }, (_, i) => hourStart + i),
    [hourStart, hourEnd]
  );
  const rowHeight = 56;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const now = new Date();
    const targetHour = Math.max(
      hourStart,
      Math.min(hourEnd - 1, now.getHours())
    );
    el.scrollTop = (targetHour - hourStart) * rowHeight;
  }, [hourStart, hourEnd, showFullDay]);

  const now = new Date();
  const nowFraction = now.getHours() + now.getMinutes() / 60 - hourStart + 1;

  const finishDrag = (dayIndex: number, endHour: number) => {
    if (dragStartHour === null || !onCreateSlot) return;
    const startH = Math.min(dragStartHour, endHour);
    const endH = Math.max(dragStartHour + 1, endHour + 1);
    const day = tableCells[dayIndex]?.date;
    if (!day) return;
    const starts = new Date(day);
    starts.setHours(startH, 0, 0, 0);
    const ends = new Date(day);
    ends.setHours(endH, 0, 0, 0);
    onCreateSlot(starts.toISOString(), ends.toISOString());
    setDragDay(null);
    setDragStartHour(null);
  };

  return (
    <div className="relative flex flex-col">
      <div className="border-border flex justify-end border-b px-3 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowFullDay((v) => !v)}
        >
          {showFullDay ? "Working hours" : "Full day"}
        </Button>
      </div>

      <div className="grid grid-cols-8 border-b border-border pr-2">
        <div className="border-border border-r" />
        {tableCells.map((cell, idx) => (
          <div className="flex flex-col items-center gap-0.5 py-2" key={idx}>
            <span className="text-muted-foreground text-sm font-medium">
              {format(cell.date, "E")}
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                isToday(cell.date) && "text-primary"
              )}
            >
              {format(cell.date, "d")}
            </span>
          </div>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="relative grid max-h-[min(60dvh,520px)] grid-cols-8 overflow-y-auto"
      >
        <div className="border-border border-r">
          {hours.map((h) => (
            <div
              key={h}
              className="text-muted-foreground flex items-start justify-center pt-1 text-xs"
              style={{ height: rowHeight }}
            >
              {`${h.toString().padStart(2, "0")}:00`}
            </div>
          ))}
        </div>

        <div className="relative col-span-7 grid grid-cols-7">
          {tableCells.map((cell, dayIndex) => {
            const isTodayCol = isToday(cell.date);
            const columnHeight = hours.length * rowHeight;
            return (
              <div
                key={cell.date.toISOString()}
                className="border-border relative border-r"
                style={{ height: columnHeight }}
                onMouseUp={() => {
                  if (dragDay === dayIndex && dragStartHour !== null) {
                    finishDrag(dayIndex, dragStartHour);
                  }
                }}
              >
                {hours.map((h, i) => (
                  <div
                    key={h}
                    className="hover:bg-muted/40 border-border/50 absolute right-0 left-0 border-b"
                    style={{
                      top: i * rowHeight,
                      height: rowHeight,
                    }}
                    onMouseDown={() => {
                      setDragDay(dayIndex);
                      setDragStartHour(h);
                    }}
                    onMouseEnter={() => {
                      if (dragDay === dayIndex && dragStartHour !== null) {
                        setDragStartHour(h);
                      }
                    }}
                  />
                ))}

                {isTodayCol &&
                nowFraction >= 0 &&
                nowFraction <= hours.length ? (
                  <div
                    className="bg-primary pointer-events-none absolute right-0 left-0 z-20 h-0.5"
                    style={{ top: nowFraction * rowHeight }}
                    aria-hidden
                  />
                ) : null}

                {cell.sessions.map((session) => {
                  const start = new Date(session.startsAt);
                  const end = new Date(session.endsAt);
                  const top =
                    (start.getHours() + start.getMinutes() / 60 - hourStart) *
                    rowHeight;
                  const height =
                    ((end.getTime() - start.getTime()) / 3_600_000) * rowHeight;
                  if (height <= 0 || top + height < 0 || top > columnHeight)
                    return null;
                  const colors = resolveSessionColor(session.color);
                  return (
                    <div
                      key={session.id}
                      style={{
                        top: Math.max(0, top),
                        height: Math.max(rowHeight / 2, height),
                        backgroundColor: colors.backgroundColor,
                        color: colors.color,
                      }}
                      className="absolute inset-x-0.5 z-10 flex flex-col gap-0.5 rounded-md border border-border/40 p-1.5 text-xs font-medium"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="line-clamp-2">{session.title}</span>
                        {session.description != null || session.meetingLink ? (
                          <Popover>
                            <PopoverTrigger
                              className="inline-flex shrink-0"
                              aria-label="View session details"
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                tabIndex={-1}
                              >
                                <ReceiptText size={14} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end">
                              <SessionDetails
                                details={{
                                  descr: session.description,
                                  meetingLink: session.meetingLink,
                                }}
                                onClose={() => {}}
                                className="border-0 shadow-none"
                              />
                            </PopoverContent>
                          </Popover>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(DesktopGridCalendar);
