import {
  BadRequestException,
  ForbiddenException,
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

    const { session, request } = await this.prisma.$transaction(async (tx) => {
      const createdSession = await tx.session.create({
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

      const createdRequest = await tx.request.create({
        data: {
          from: { connect: { id: myId } },
          to: { connect: { id: dto.friendId } },
          session: { connect: { id: createdSession.id } },
          type: 'SESSIONCREATED',
        },
        include: this.requests.getBasicRequestInclude(),
      });

      return { session: createdSession, request: createdRequest };
    });

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
      take: 200,
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
      take: 50,
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
    await this.assertSessionParticipant(sessionId, myId);

    const originalReq = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
    });

    if (!originalReq) {
      throw new NotFoundException('Original request not found');
    }

    const request = await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: sessionId },
        data: { status: 'AGREED' },
      });

      const statusRequest = await tx.request.create({
        data: {
          from: { connect: { id: myId } },
          to: { connect: { id: originalReq.fromId } },
          session: { connect: { id: sessionId } },
          type: 'SESSIONACCEPTED',
        },
        include: this.requests.getBasicRequestInclude(),
      });

      await tx.request.delete({ where: { id: dto.requestId } });

      return statusRequest;
    });

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
    await this.assertSessionParticipant(sessionId, myId);

    const originalReq = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
    });

    if (!originalReq) {
      throw new NotFoundException('Original request not found');
    }

    const request = await this.prisma.$transaction(async (tx) => {
      const statusRequest = await tx.request.create({
        data: {
          from: { connect: { id: myId } },
          to: { connect: { id: originalReq.fromId } },
          session: { connect: { id: sessionId } },
          type: 'SESSIONREJECTED',
        },
        include: this.requests.getBasicRequestInclude(),
      });

      await tx.request.delete({ where: { id: dto.requestId } });
      await tx.session.delete({ where: { id: sessionId } });

      return statusRequest;
    });

    this.requestGateway.notifyUserRejectedSession(originalReq.fromId, {
      request,
    });

    return { data: dto.requestId, message: 'Session request rejected' };
  }

  private async assertSessionParticipant(sessionId: string, userId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        users: { some: { id: userId } },
      },
      select: { id: true },
    });

    if (!session) {
      throw new ForbiddenException('You are not a participant of this session');
    }
  }
}
