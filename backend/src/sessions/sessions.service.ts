import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RequestsService } from 'src/requests/requests.service';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService, private readonly requests: RequestsService, private readonly requestGateway: RequestGateway) { };
  async create(dto: CreateSessionDto, myId: string) {
    const now = new Date();
    const overlappingSessions = await this.prisma.session.findMany({ where: { date: new Date(dto.date), start: { lt: dto.end }, end: { gt: dto.start } } });
    if (overlappingSessions.length > 0) {
      throw new BadRequestException('This time range is busy.')
    }
    else if (new Date(dto.date).getDate() < now.getDate() || dto.start < now.getHours() && new Date(dto.date).getDate() == now.getDate()) {
      throw new BadRequestException('The time must not have passed.')

    }
    const friendship = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { user1Id: myId, user2Id: dto.friendId },
          { user2Id: myId, user1Id: dto.friendId }
        ]
      },
      include: {
        user1: { select: { name: true, id: true } },
        user2: { select: { name: true, id: true } },
      }
    });

    if (!friendship) {
      throw new BadRequestException('There`s no such friend in your list')
    }
    const session = await this.prisma.session.create({
      data: {
        title: dto.title, description: dto.description, start: dto.start, end: dto.end, date: new Date(dto.date), color: dto.color, users: {
          connect: [
            { id: myId },
            { id: dto.friendId },
          ],
        },
      }
    });
    const request = await this.requests.createForSession(session.id, myId, dto.friendId);
    this.requestGateway.notifyUserSession(dto.friendId, { request });
    return friendship.user1.id == myId ? {
      ...session, friend: {
        id: friendship.user2.id, name: friendship.user2.name
      }
    } : {
      ...session, friend: {
        id: friendship.user1.id, name: friendship.user1.name
      }
    }

  }

  async findAll(month: number, myId: string) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const sessions = await this.prisma.session.findMany({
      where: {
        users: { some: { id: myId } }, date: {
          gte: firstDay,
          lte: lastDay
        }

      },
      include: {
        users: { select: { id: true, name: true } }
      }
    })
    const newSessions = sessions.map(item => {
      const { users, ...session } = item;
      const friend = users.find(user => user.id !== myId);
      if (friend)
        return { ...session, friend: { id: friend.id, name: friend.name } };
      return session;
    })
    return newSessions;
  }

  async acceptSessionRequest(dto: UpdateSessionStatusDto, myId: string, sessionId: string) {
    const session = await this.prisma.session.update({ where: { id: sessionId }, data: { status: 'AGREED' } })
    const originalReq = await this.prisma.request.findUnique({ where: { id: dto.requestId } });
    if (!originalReq) throw new BadRequestException('Original request not found');
    const request = await this.requests.createForStatusSession(session.id, myId, originalReq.fromId, 'ACCEPTED');
    const req = await this.prisma.request.delete({ where: { id: dto.requestId } });
    this.requestGateway.notifyUserAcceptedSession(originalReq.fromId, { request });
    return req.id
  }
  // rejecting the session request, in other words -- deleting the session
  async rejectSessionRequest(dto: UpdateSessionStatusDto, myId: string, sessionId: string) {
    const originalReq = await this.prisma.request.findUnique({ where: { id: dto.requestId } });
    if (!originalReq) throw new BadRequestException('Original request not found');
    const request = await this.requests.createForStatusSession(sessionId, myId, originalReq.fromId, 'REJECTED');
    const req = await this.prisma.request.delete({ where: { id: dto.requestId } });
    const session = await this.prisma.session.delete({ where: { id: sessionId } });
    this.requestGateway.notifyUserRejectedSession(originalReq.fromId, { request });
    return req.id
  }


}
