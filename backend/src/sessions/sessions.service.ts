import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) { };
  async create(dto: CreateSessionDto, myId: string) {

    const overlappingSessions = await this.prisma.session.findMany({ where: { date: new Date(dto.date), start: { lt: dto.end }, end: { gt: dto.start } } });
    if (overlappingSessions.length > 0) {
      throw new BadRequestException('This time range is busy!')
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
    return session;
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
      }
    })
    console.log(sessions);
    return sessions;
  }


}
