import { format } from "date-fns";

import type { ISession } from "@/types/session";

export function formatSessionTimeRange(
  startsAt: string | Date,
  endsAt: string | Date
): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
}

export function formatSessionDay(startsAt: string | Date): string {
  return format(new Date(startsAt), "MMM d, yyyy");
}

export function sessionStartDate(session: ISession): Date {
  return new Date(session.startsAt);
}

export function isSessionUpcoming(
  session: ISession,
  now = new Date()
): boolean {
  return new Date(session.startsAt) >= now;
}

export function sessionDurationMinutes(session: ISession): number {
  const start = new Date(session.startsAt).getTime();
  const end = new Date(session.endsAt).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

/** Grid placement: hour index 0–23 and fractional offset within hour */
export function sessionGridPlacement(
  startsAt: string | Date,
  endsAt: string | Date
) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startRow = start.getHours() + start.getMinutes() / 60 + 1;
  const endRow = end.getHours() + end.getMinutes() / 60 + 1;
  return {
    gridRowStart: startRow,
    gridRowEnd: Math.max(startRow + 0.25, endRow),
  };
}
