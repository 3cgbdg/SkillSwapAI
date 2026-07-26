"use client";

import CalendarPopup from "@/components/calendar/CalendarPopup";
import DesktopGridCalendar from "@/components/calendar/DesktopGridCalendar";
import TouchScreenCalendar from "@/components/calendar/TouchScreenCalendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import SessionsService from "@/services/SessionsService";
import { ISession } from "@/types/session";
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { showErrorToast } from "@/utils/toast";

export type CalendarSession = {
  id: string;
  title: string;
  start: number;
  end: number;
  description?: string;
  color: string;
  status: ISession["status"];
  meetingLink: string | null;
};

export type TableCellType = {
  date: Date;
  sessions: CalendarSession[];
};

const Calendar = () => {
  const searchParams = useSearchParams();
  const scheduleName = searchParams.get("name");
  const shouldOpenSchedule = searchParams.get("schedule") === "true";

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [addSessionPopup, setAddSessionPopup] = useState(false);
  const [schedulePartner, setSchedulePartner] = useState<string | null>(null);

  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(weekAnchor, { weekStartsOn: 0 });
  const month = weekAnchor.getMonth();

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["sessions", month],
    queryFn: () => SessionsService.getSessions(month),
  });

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "Failed to load sessions");
    }
  }, [isError, error]);

  useEffect(() => {
    if (shouldOpenSchedule && scheduleName) {
      setSchedulePartner(scheduleName);
      setAddSessionPopup(true);
    }
  }, [shouldOpenSchedule, scheduleName]);

  const normalizedSessions = useMemo(() => {
    return sessions.map((session) => ({
      ...session,
      date: new Date(session.date),
    }));
  }, [sessions]);

  const tableCells: TableCellType[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const daySessions = normalizedSessions
        .filter((session) => isSameDay(session.date, date))
        .map((session) => ({
          id: session.id,
          title: session.title,
          start: session.start,
          end: session.end,
          description: session.description,
          color: session.color,
          status: session.status,
          meetingLink: session.meetingLink,
        }));
      return { date, sessions: daySessions };
    });
  }, [normalizedSessions, weekStart]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-9 text-foreground">
            Calendar
          </h1>
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
              setAddSessionPopup(true);
            }}
          >
            <Plus size={16} />
            New session
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex h-[440px] items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <DesktopGridCalendar tableCells={tableCells} />
            </div>
            <div className="md:hidden">
              <TouchScreenCalendar tableCells={tableCells} />
            </div>
          </>
        )}
      </Card>

      {addSessionPopup ? (
        <CalendarPopup
          year={weekAnchor.getFullYear()}
          month={weekAnchor.getMonth()}
          otherName={schedulePartner}
          setAddSessionPopup={setAddSessionPopup}
        />
      ) : null}
    </div>
  );
};

export default Calendar;
