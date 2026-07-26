import { BadRequestException } from '@nestjs/common';
import { ISessionPrismaResult, ISessionWithFriend } from 'types/sessions';

export class SessionsUtils {
  static validateSessionTime(startsAt: string) {
    const start = new Date(startsAt);
    const now = new Date();
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Invalid session time.');
    }
    if (start.getTime() < now.getTime()) {
      throw new BadRequestException('The time must not have passed.');
    }
  }

  static validateRange(startsAt: string, endsAt: string) {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (end.getTime() <= start.getTime()) {
      throw new BadRequestException('End time must be after start time.');
    }
  }

  static mapSessionWithFriend(
    session: ISessionPrismaResult,
    myId: string,
  ): ISessionWithFriend {
    const { users, ...sessionData } = session;
    const friend = users?.find((user) => user.id !== myId);

    return {
      ...sessionData,
      friend: friend
        ? { id: friend.id, name: friend.name, imageUrl: friend.imageUrl }
        : null,
    };
  }
}
