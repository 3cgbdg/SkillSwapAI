import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService, private readonly requestGateway: RequestGateway) { };
  async create(dto: CreateRequestDto, userId: string) {
    await this.prisma.request.create({ data: { toId: dto.id, fromId: userId } });
    this.requestGateway.notifyUser(dto.id, { from: userId, to: dto.id })
    return { message: "Successfully created!" }
  }

  async findAll(userId: string) {
    const reqs = await this.prisma.request.findMany({ where: { toId: userId }, include: { from: { select: { name: true } }, to: { select: { name: true } } } });
    return reqs;
  }


}
