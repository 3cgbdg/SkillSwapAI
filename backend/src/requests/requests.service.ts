import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { IReturnMessage, ReturnDataType } from 'types/general';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestGateway: RequestGateway,
  ) { }

  async createForFriendship(
    dto: CreateRequestDto,
    userId: string,
  ): Promise<IReturnMessage> {
    if (dto.id) {
      const exist = await this.prisma.request.findFirst({
        where: {
          OR: [
            { fromId: userId, toId: dto.id },
            { fromId: dto.id, toId: userId },
          ],
        },
      });
      if (exist)
        throw new BadRequestException(
          'Friend request already exists or is pending.',
        );
      const request = await this.prisma.request.create({
        data: { toId: dto.id, fromId: userId, type: 'FRIEND' },
        include: {
          from: { select: { name: true, firstName: true, lastName: true } },
          to: { select: { name: true, firstName: true, lastName: true } },
        },
      });
      this.requestGateway.notifyUser(dto.id, { request });
      return { message: 'Friend request is successfully created' };
    } else {
      const foundUser = await this.prisma.user.findUnique({
        where: { name: dto.name },
        select: { id: true },
      });
      if (foundUser) {
        const exist = await this.prisma.request.findFirst({
          where: {
            OR: [
              { fromId: userId, toId: foundUser.id },
              { fromId: foundUser.id, toId: userId },
            ],
          },
        });
        if (exist)
          throw new BadRequestException(
            'Friend request already exists or is pending.',
          );
        const request = await this.prisma.request.create({
          data: { toId: foundUser.id, fromId: userId, type: 'FRIEND' },
          include: {
            from: { select: { name: true, firstName: true, lastName: true } },
            to: { select: { name: true, firstName: true, lastName: true } },
          },
        });
        this.requestGateway.notifyUser(foundUser.id, { request });
        return { message: 'Friend request is successfully created' };
      } else {
        throw new NotFoundException('User with such username wasn`t found');
      }
    }
  }

  async findAll(userId: string): Promise<ReturnDataType<any>> {
    const data = await this.prisma.request.findMany({
      where: { toId: userId },
      include: {
        from: { select: { name: true, firstName: true, lastName: true } },
        session: { select: { start: true, end: true, date: true } },
        to: { select: { name: true, firstName: true, lastName: true } },
      },
    });
    return { data };
  }

  async createForSession(sessionId: string, myId: string, friendId: string) {
    const request = await this.prisma.request.create({
      data: {
        from: { connect: { id: myId } },
        to: { connect: { id: friendId } },
        session: { connect: { id: sessionId } },
        type: 'SESSIONCREATED',
      },
      include: {
        session: { select: { start: true, end: true, date: true } },
        from: { select: { name: true, firstName: true, lastName: true } },
        to: { select: { name: true, firstName: true, lastName: true } },
      },
    });
    return request;
  }

  async createForStatusSession(
    sessionId: string,
    myId: string,
    friendId: string,
    option: 'REJECTED' | 'ACCEPTED',
  ) {
    if (option == 'ACCEPTED') {
      const request = await this.prisma.request.create({
        data: {
          from: { connect: { id: myId } },
          to: { connect: { id: friendId } },
          session: { connect: { id: sessionId } },
          type: 'SESSIONACCEPTED',
        },
        include: {
          session: { select: { title: true } },
          from: { select: { name: true } },
          to: { select: { name: true } },
        },
      });
      return request;
    } else if (option == 'REJECTED') {
      const request = await this.prisma.request.create({
        data: {
          from: { connect: { id: myId } },
          to: { connect: { id: friendId } },
          session: { connect: { id: sessionId } },
          type: 'SESSIONREJECTED',
        },
        include: {
          session: { select: { title: true } },
          from: { select: { name: true } },
          to: { select: { name: true } },
        },
      });
      return request;
    } else {
      throw new InternalServerErrorException();
    }
  }

  async deleteOne(requestId: string): Promise<IReturnMessage> {
    const req = await this.prisma.request.delete({ where: { id: requestId } });
    return { message: `Request with ID ${req.id} successfully deleted` };
  }
}
