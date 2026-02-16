import { Request } from 'express';
import { User } from '@prisma/client';

export interface RequestWithUser extends Request {
  user: User;
}

export interface JwtPayload {
  userId: string;
}

export interface GoogleProfile {
  id: string;
  emails: { value: string; verified: boolean }[];
  name: {
    givenName: string;
    familyName: string;
  };
  photos: { value: string }[];
  provider: string;
  _raw: string;
  _json: any;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}
