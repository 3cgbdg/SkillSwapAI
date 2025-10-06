import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) { };
  async create(dto: CreateSessionDto, myId: string) {

    const overlappingSessions = await this.prisma.session.findMany({ where: { date: new Date(dto.date), start: { lt: dto.end }, end: { gt: dto.start } } });
    if (overlappingSessions.length > 0) {
      throw new BadRequestException('This time range is busy.')
    }
    else if (new Date(dto.date).getDate() < new Date().getDate()) {
      throw new BadRequestException('The date must not have passed.')

    }
   const friendship = await this.prisma.friend.findFirst({
  where: {
    OR: [
      { user1Id: myId, user2Id: dto.friendId },
      { user2Id: myId, user1Id: dto.friendId }
    ]
  },
  include:{
    user1:{select:{name:true,id:true}},
    user2:{select:{name:true,id:true}},
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
    return friendship.user1.id==myId ?{...session,friend:{
      id:friendship.user2.id,name:friendship.user2.name
    }} :{...session,friend:{
      id:friendship.user1.id,name:friendship.user1.name
    }} 
   
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


}
