"use client";

import CalendarPopup from "@/components/calendar/CalendarPopup";
import DesktopGridCalendar from "@/components/calendar/DesktopGridCalendar";
import TouchScreenCalendar from "@/components/calendar/TouchScreenCalendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import SessionsService from "@/services/SessionsService";
import { ISession } from "@/types/session";
import { AsyncBoundary } from "@/components/composites";
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { sessionStartDate } from "@/utils/sessionTime";

export type CalendarSession = {
  id: string;
  title: string;
  startsAt: string | Date;
  endsAt: string | Date;
  description?: string;
  color: string;
  status: ISession["status"];
  meetingLink: string | null;
};

export type TableCellType = {
  date: Date;
  sessions: CalendarSession[];
};

export type CalendarPopupPrefill = {
  startsAt: string;
  endsAt: string;
} | null;

const Calendar = () => {
  const searchParams = useSearchParams();
  const scheduleName = searchParams.get("name");
  const shouldOpenSchedule = searchParams.get("schedule") === "true";

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [addSessionPopup, setAddSessionPopup] = useState(false);
  const [schedulePartner, setSchedulePartner] = useState<string | null>(null);
  const [popupPrefill, setPopupPrefill] = useState<CalendarPopupPrefill>(null);

  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(weekAnchor, { weekStartsOn: 0 });
  const rangeFrom = weekStart.toISOString();
  const rangeTo = weekEnd.toISOString();

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["sessions", rangeFrom, rangeTo],
    queryFn: () => SessionsService.getSessionsRange(rangeFrom, rangeTo),
  });

  useEffect(() => {
    if (shouldOpenSchedule && scheduleName) {
      setSchedulePartner(scheduleName);
      setAddSessionPopup(true);
    }
  }, [shouldOpenSchedule, scheduleName]);

  const tableCells: TableCellType[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const daySessions = sessions
        .filter((session) => isSameDay(sessionStartDate(session), date))
        .map((session) => ({
          id: session.id,
          title: session.title,
          startsAt: session.startsAt,
          endsAt: session.endsAt,
          description: session.description,
          color: session.color,
          status: session.status,
          meetingLink: session.meetingLink,
        }));
      return { date, sessions: daySessions };
    });
  }, [sessions, weekStart]);

  return (
    <AsyncBoundary isError={isError} error={error}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-h1 text-foreground">Calendar</h1>
            <p className="text-muted-foreground text-sm">
              {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setWeekAnchor((d) => addDays(d, -7))}
              aria-label="Previous week"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setWeekAnchor((d) => addDays(d, 7))}
              aria-label="Next week"
            >
              <ChevronRight />
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                setSchedulePartner(null);
                setPopupPrefill(null);
                setAddSessionPopup(true);
              }}
            >
              <Plus size={16} />
              New session
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden p-0" elevation="raised">
          {isLoading ? (
            <div className="flex h-[440px] items-center justify-center">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DesktopGridCalendar
                  tableCells={tableCells}
                  onCreateSlot={(startsAt, endsAt) => {
                    setPopupPrefill({ startsAt, endsAt });
                    setAddSessionPopup(true);
                  }}
                />
              </div>
              <div className="md:hidden">
                <TouchScreenCalendar
                  tableCells={tableCells}
                  onCreateSession={() => {
                    setSchedulePartner(null);
                    setPopupPrefill(null);
                    setAddSessionPopup(true);
                  }}
                />
              </div>
            </>
          )}
        </Card>

        {addSessionPopup ? (
          <CalendarPopup
            weekAnchor={weekAnchor}
            prefill={popupPrefill}
            otherName={schedulePartner}
            setAddSessionPopup={setAddSessionPopup}
            onClose={() => {
              setPopupPrefill(null);
              setAddSessionPopup(false);
            }}
          />
        ) : null}
      </div>
    </AsyncBoundary>
  );
};

export default Calendar;
