import { Request as PrismaRequest } from '@prisma/client';

export type RequestType = 'FRIEND' | 'SESSIONCREATED' | 'SESSIONACCEPTED' | 'SESSIONREJECTED';

export interface IRequestUser {
    id: string;
    name: string | null;
    imageUrl: string | null;
}

export interface IRequestSession {
    title: string;
    start: number;
    end: number;
    date: Date;
}

export interface IRequestWithSession extends PrismaRequest {
    from: IRequestUser;
    to: IRequestUser;
    session: IRequestSession | null;
}
