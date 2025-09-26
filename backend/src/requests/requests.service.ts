import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService, private readonly requestGateway: RequestGateway) { };
  async create(dto: CreateRequestDto, userId: string) {
    const exist = await this.prisma.request.findFirst({
      where: {
        OR: [
          { fromId: userId, toId: dto.id },
          { fromId: dto.id, toId: userId },
        ]
      }
    })
    if (exist) return;
    
    const request = await this.prisma.request.create({ data: { toId: dto.id, fromId: userId }, include: { from: { select: { name: true } }, to: { select: { name: true } } } });
    this.requestGateway.notifyUser(dto.id, { request })
    return { message: "Successfully created!" }
  }

  async findAll(userId: string) {
    const reqs = await this.prisma.request.findMany({ where: { toId: userId }, include: { from: { select: { name: true } }, to: { select: { name: true } } } });
    return reqs;
  }


}
