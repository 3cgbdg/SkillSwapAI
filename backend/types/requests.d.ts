import { Request as PrismaRequest } from '../src/prisma/prisma-exports.js';

export type RequestType =
  | 'FRIEND'
  | 'SESSIONCREATED'
  | 'SESSIONACCEPTED'
  | 'SESSIONREJECTED';

export interface IRequestUser {
  id: string;
  name: string | null;
  imageUrl: string | null;
}

export interface IRequestSession {
  title: string;
  startsAt: Date;
  endsAt: Date;
}

export interface IRequestWithSession extends PrismaRequest {
  from: IRequestUser;
  to: IRequestUser;
  session: IRequestSession | null;
}
