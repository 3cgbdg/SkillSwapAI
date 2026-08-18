import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { IReturnMessage, ReturnDataType } from 'types/general';
import { IRequestWithSession } from 'types/requests';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestGateway: RequestGateway,
  ) {}

  async createFriendRequest(
    dto: CreateRequestDto,
    userId: string,
  ): Promise<ReturnDataType<IRequestWithSession>> {
    if (dto.id) {
      return this.createFriendRequestById(dto.id, userId);
    }

    if (!dto.name) {
      throw new BadRequestException('Recipient ID or Name must be provided');
    }

    return this.createFriendRequestByName(dto.name, userId);
  }

  private async createFriendRequestById(
    recipientId: string,
    senderId: string,
  ): Promise<ReturnDataType<IRequestWithSession>> {
    await this.ensureRequestDoesNotExist(senderId, recipientId);

    const request = await this.prisma.request.create({
      data: { toId: recipientId, fromId: senderId, type: 'FRIEND' },
      include: this.getBasicRequestInclude(),
    });

    this.notifyRecipient(recipientId, request);

    return {
      data: request,
      message: 'Friend request is successfully created',
    };
  }

  private async createFriendRequestByName(
    recipientName: string,
    senderId: string,
  ): Promise<ReturnDataType<IRequestWithSession>> {
    const recipient = await this.prisma.user.findUnique({
      where: { name: recipientName },
    });

    if (!recipient) {
      throw new NotFoundException(
        `User with username "${recipientName}" not found`,
      );
    }

    if (recipient.id === senderId) {
      throw new BadRequestException('You cannot send a request to yourself');
    }

    await this.ensureRequestDoesNotExist(senderId, recipient.id);

    const request = await this.prisma.request.create({
      data: { toId: recipient.id, fromId: senderId, type: 'FRIEND' },
      include: this.getBasicRequestInclude(),
    });

    this.notifyRecipient(recipient.id, request);

    return {
      data: request,
      message: 'Friend request is successfully created',
    };
  }

  private async ensureRequestDoesNotExist(fromId: string, toId: string) {
    const existingRequest = await this.prisma.request.findFirst({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId },
        ],
        type: 'FRIEND',
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'Friend request already exists or is pending.',
      );
    }
  }

  getBasicRequestInclude() {
    return {
      from: { select: { id: true, name: true, imageUrl: true } },
      to: { select: { id: true, name: true, imageUrl: true } },
      session: { select: { title: true, startsAt: true, endsAt: true } },
    };
  }

  private notifyRecipient(recipientId: string, request: IRequestWithSession) {
    this.requestGateway.notifyUser(recipientId, { request });
  }

  async findAll(
    userId: string,
  ): Promise<ReturnDataType<IRequestWithSession[]>> {
    const requests = (await this.prisma.request.findMany({
      where: { toId: userId },
      include: this.getBasicRequestInclude(),
      take: 100,
      orderBy: { id: 'desc' },
    })) as unknown as IRequestWithSession[];
    return { data: requests };
  }

  async createSessionRequest(
    sessionId: string,
    senderId: string,
    recipientId: string,
  ): Promise<IRequestWithSession> {
    return await this.prisma.request.create({
      data: {
        from: { connect: { id: senderId } },
        to: { connect: { id: recipientId } },
        session: { connect: { id: sessionId } },
        type: 'SESSIONCREATED',
      },
      include: this.getBasicRequestInclude(),
    });
  }

  async createSessionStatusRequest(
    sessionId: string,
    senderId: string,
    recipientId: string,
    option: 'REJECTED' | 'ACCEPTED',
  ): Promise<IRequestWithSession> {
    const type = option === 'ACCEPTED' ? 'SESSIONACCEPTED' : 'SESSIONREJECTED';
    return await this.prisma.request.create({
      data: {
        from: { connect: { id: senderId } },
        to: { connect: { id: recipientId } },
        session: { connect: { id: sessionId } },
        type,
      },
      include: this.getBasicRequestInclude(),
    });
  }

  async deleteOne(requestId: string, userId: string): Promise<IReturnMessage> {
    const { count } = await this.prisma.request.deleteMany({
      where: {
        id: requestId,
        OR: [{ fromId: userId }, { toId: userId }],
      },
    });

    if (count === 0) {
      throw new NotFoundException('Request not found');
    }

    return { message: 'Request successfully cleared' };
  }
}
