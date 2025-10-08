import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService, private readonly requestGateway: RequestGateway) { };
  async createForFriendship(dto: CreateRequestDto, userId: string) {
    const exist = await this.prisma.request.findFirst({
      where: {
        OR: [
          { fromId: userId, toId: dto.id },
          { fromId: dto.id, toId: userId },
        ]
      }
    })
    if (exist) return;

    const request = await this.prisma.request.create({ data: { toId: dto.id, fromId: userId, type: "FRIEND" }, include: { from: { select: { name: true } }, to: { select: { name: true } } } });
    this.requestGateway.notifyUser(dto.id, { request })
    return { message: "Successfully created!" }
  }

  async findAll(userId: string) {
    const reqs = await this.prisma.request.findMany({ where: { toId: userId }, include: { from: { select: { name: true } }, session: { select: { start: true, end: true, date: true } }, to: { select: { name: true } } } });
    return reqs;
  }

  async createForSession(sessionId: string, myId: string, friendId: string) {

    const request = await this.prisma.request.create({ data: { toId: friendId, fromId: myId,sessionId:sessionId, session: { connect: { id: sessionId } }, type: "SESSION" }, include: {  session: { select: { start: true, end: true, date: true } }, from: { select: { name: true } }, to: { select: { name: true } } } });

    return request;
  }




}
