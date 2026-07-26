import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RequestsService } from 'src/requests/requests.service';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { ReturnDataType } from 'types/general';
import { SessionsUtils } from './utils/sessions.utils';
import { ISessionWithFriend, ISessionPrismaResult } from 'types/sessions';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requests: RequestsService,
    private readonly requestGateway: RequestGateway,
  ) {}

  async create(
    dto: CreateSessionDto,
    myId: string,
  ): Promise<ReturnDataType<ISessionWithFriend>> {
    SessionsUtils.validateSessionTime(dto.startsAt);
    SessionsUtils.validateRange(dto.startsAt, dto.endsAt);

    await this.ensureNoOverlappingSessions(dto, myId, dto.friendId);

    const friendship = await this.findFriendship(myId, dto.friendId);
    if (!friendship) {
      throw new BadRequestException('Friend not found in your list');
    }

    const session = await this.prisma.session.create({
      data: {
        title: dto.title,
        description: dto.description,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        timeZone: dto.timeZone,
        meetingLink: dto.meetingLink,
        color: dto.color,
        users: {
          connect: [{ id: myId }, { id: dto.friendId }],
        },
      },
      include: {
        users: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    const request = await this.requests.createSessionRequest(
      session.id,
      myId,
      dto.friendId,
    );
    this.requestGateway.notifyUserSession(dto.friendId, { request });

    return {
      message: 'Session has been successfully created',
      data: SessionsUtils.mapSessionWithFriend(session, myId),
    };
  }

  private async ensureNoOverlappingSessions(
    dto: CreateSessionDto,
    myId: string,
    friendId: string,
  ) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    const overlappingSessions = await this.prisma.session.findMany({
      where: {
        users: { some: { id: { in: [myId, friendId] } } },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    if (overlappingSessions.length > 0) {
      throw new BadRequestException('This time range is busy.');
    }
  }

  private async findFriendship(myId: string, friendId: string) {
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: myId, user2Id: friendId },
          { user2Id: myId, user1Id: friendId },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, imageUrl: true } },
        user2: { select: { id: true, name: true, imageUrl: true } },
      },
    });
  }

  async findAll(
    from: string,
    to: string,
    myId: string,
  ): Promise<ReturnDataType<ISessionWithFriend[]>> {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    const sessions = (await this.prisma.session.findMany({
      where: {
        users: { some: { id: myId } },
        startsAt: { gte: fromDate, lte: toDate },
      },
      include: {
        users: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { startsAt: 'asc' },
    })) as unknown as ISessionPrismaResult[];

    return {
      data: sessions.map((s) => SessionsUtils.mapSessionWithFriend(s, myId)),
    };
  }

  async findTodaysSessions(
    myId: string,
  ): Promise<ReturnDataType<ISessionWithFriend[]>> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = (await this.prisma.session.findMany({
      where: {
        users: { some: { id: myId } },
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        users: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { startsAt: 'asc' },
    })) as unknown as ISessionPrismaResult[];

    return {
      data: sessions.map((s) => SessionsUtils.mapSessionWithFriend(s, myId)),
    };
  }

  async acceptSessionRequest(
    dto: UpdateSessionStatusDto,
    myId: string,
    sessionId: string,
  ): Promise<ReturnDataType<string>> {
    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'AGREED' },
    });

    const originalReq = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
    });

    if (!originalReq) {
      throw new NotFoundException('Original request not found');
    }

    const request = await this.requests.createSessionStatusRequest(
      session.id,
      myId,
      originalReq.fromId,
      'ACCEPTED',
    );

    await this.prisma.request.delete({ where: { id: dto.requestId } });

    this.requestGateway.notifyUserAcceptedSession(originalReq.fromId, {
      request,
    });

    return { data: dto.requestId, message: 'Session request accepted' };
  }

  async rejectSessionRequest(
    dto: UpdateSessionStatusDto,
    myId: string,
    sessionId: string,
  ): Promise<ReturnDataType<string>> {
    const originalReq = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
    });

    if (!originalReq) {
      throw new NotFoundException('Original request not found');
    }

    const request = await this.requests.createSessionStatusRequest(
      sessionId,
      myId,
      originalReq.fromId,
      'REJECTED',
    );

    await this.prisma.request.delete({ where: { id: dto.requestId } });
    await this.prisma.session.delete({ where: { id: sessionId } });

    this.requestGateway.notifyUserRejectedSession(originalReq.fromId, {
      request,
    });

    return { data: dto.requestId, message: 'Session request rejected' };
  }
}
