import { Request } from 'express';
import { User } from '@prisma/client';

export interface RequestWithUser extends Request {
    user: User;
}

export interface JwtPayload {
    userId: string;
}
