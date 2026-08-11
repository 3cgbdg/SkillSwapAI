export type SessionStatusType = "PENDING" | "AGREED";

export type SessionColorKey =
  | "plum"
  | "amber"
  | "sage"
  | "coral"
  | "slate"
  | "violet";

export interface ISession {
  id: string;
  title: string;
  startsAt: string | Date;
  endsAt: string | Date;
  timeZone: string;
  description?: string;
  color: SessionColorKey | string;
  friend: {
    id: string;
    name: string;
  } | null;
  status: SessionStatusType;
  meetingLink: string | null;
}

export interface IRequest {
  id: string;
  fromId: string;
  toId: string;
  from: { name: string };
  to: { name: string };
  type: "FRIEND" | "SESSIONCREATED" | "SESSIONACCEPTED" | "SESSIONREJECTED";
  sessionId: string;
  session: {
    startsAt?: string;
    endsAt?: string;
    title?: string;
    timeZone?: string;
  };
}
