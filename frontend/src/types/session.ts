export type SessionStatusType = "PENDING" | "AGREED";

export interface ISession {
    id: string;
    title: string;
    start: number;
    end: number;
    description?: string;
    color: string;
    date: Date;
    friend: {
        id: string;
        name: string;
    };
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
        date?: string;
        start?: number;
        end?: number;
        title?: string;
    }; //if request type is session
}
