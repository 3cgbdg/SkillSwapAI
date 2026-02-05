import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChatGateway } from 'src/webSockets/chat.gateway';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) {}
  async create(dto: CreateFriendDto, id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.id } });
    if (!user) throw new NotFoundException();
    const friends = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: id, user2Id: dto.id },
          { user2Id: id, user1Id: dto.id },
        ],
      },
    });
    if (friends.length > 0) {
      throw new BadRequestException('Such friendship already exists');
    }
    await this.prisma.friendship.create({
      data: { user1Id: dto.id, user2Id: id },
    });
    await this.prisma.request.deleteMany({
      where: { fromId: dto.id, toId: id, type: 'FRIEND' },
    });
    return { message: `${user.name} successfully added to friends!` };
  }

  async findAll(id: string) {
    const friends1 = await this.prisma.friendship.findMany({
      where: { user1Id: id },
      include: { user2: { select: { id: true, name: true, imageUrl: true } } },
    });
    const friends2 = await this.prisma.friendship.findMany({
      where: { user2Id: id },
      include: { user1: { select: { id: true, name: true, imageUrl: true } } },
    });
    return [
      ...friends1.map((item) => item.user2),
      ...friends2.map((item) => item.user1),
    ];
  }

  async getOnlineFriends(myId: string): Promise<string[]> {
    const friends = await this.chatGateway.getCurrentOnlineFriends(myId);
    return friends;
  }
}
