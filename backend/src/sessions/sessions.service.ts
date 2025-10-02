import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) { };
  async create(dto: CreateSessionDto) {
    console.log(dto)
    await this.prisma.session.create({ data: { title: dto.title, description: dto.description, start: dto.start, end: dto.end, date: new Date(dto.date),color:dto.color } });
    return { message: "Successfully created!" }
  }


}
