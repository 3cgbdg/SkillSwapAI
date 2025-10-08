import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) { };
  async create(dto: CreateFriendDto, id: string) {
    const friends = await this.prisma.friend.findMany({
      where: {
        OR: [
          { user1Id: id, user2Id: dto.id },
          { user2Id: id, user1Id: dto.id }
        ]
      }
    });
    if (friends.length > 0) {
      throw new BadRequestException('Such friendship already exists')
    }
    await this.prisma.friend.create({ data: { user1Id: dto.id, user2Id: id } });
    await this.prisma.request.deleteMany({ where: { fromId: dto.id, toId: id, type: 'FRIEND' } })
    return { message: "Sucessfully added to friends!" }
  }

  async findAll(id: string) {
    const friends1 = await this.prisma.friend.findMany({ where: { user1Id: id }, include: { user2: { select: { id: true, name: true, } } } });
    const friends2 = await this.prisma.friend.findMany({ where: { user2Id: id }, include: { user1: { select: { id: true, name: true } } } });
    return [...friends1.map(item => item.user2), ...friends2.map(item => item.user1)]
  }
}
