import { BadRequestException } from '@nestjs/common';
import { Session } from '@prisma/client';

export class SessionsUtils {
    static validateSessionTime(date: string, start: number, end: number) {
        const sessionDate = new Date(date);
        const now = new Date();

        if (this.isDateInPast(sessionDate, now)) {
            throw new BadRequestException('The time must not have passed.');
        }

        if (this.isHourInPast(sessionDate, start, now)) {
            throw new BadRequestException('The time must not have passed.');
        }
    }

    private static isDateInPast(date: Date, now: Date): boolean {
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        const nowDate = new Date(now);
        nowDate.setHours(0, 0, 0, 0);

        return compareDate < nowDate;
    }

    private static isHourInPast(date: Date, start: number, now: Date): boolean {
        const isToday = date.toDateString() === now.toDateString();
        return isToday && start < now.getHours();
    }

    static mapSessionWithFriend(session: any, myId: string) {
        const { users, ...sessionData } = session;
        const friend = users?.find((user: any) => user.id !== myId);

        return {
            ...sessionData,
            friend: friend ? { id: friend.id, name: friend.name } : null,
        };
    }
}
