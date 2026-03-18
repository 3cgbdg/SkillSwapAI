import { Session as PrismaSession } from '@prisma/client';

export interface ISessionFriend {
  id: string;
  name: string | null;
  imageUrl?: string | null;
}

export interface ISessionWithFriend extends Omit<PrismaSession, 'date'> {
  date: Date | string;
  friend: ISessionFriend | null;
}

export interface ISessionPrismaResult extends PrismaSession {
  users: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  }[];
}
