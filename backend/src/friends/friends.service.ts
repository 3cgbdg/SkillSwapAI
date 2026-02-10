import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChatGateway } from 'src/webSockets/chat.gateway';
import { IReturnMessage, ReturnDataType } from 'types/general';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) { }
  async create(dto: CreateFriendDto, id: string): Promise<IReturnMessage> {
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

  async findAll(id: string): Promise<ReturnDataType<any>> {
    const friends = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: id }, { user2Id: id }],
      },
      include: {
        user1: { select: { id: true, name: true, imageUrl: true } },
        user2: { select: { id: true, name: true, imageUrl: true } },
      },
    });
    const data = friends.map((f) => {
      if (f.user1Id == id) {
        return f.user2;
      } else return f.user1;
    });
    return { data };
  }

  async getOnlineFriends(myId: string): Promise<ReturnDataType<string[]>> {
    const data = await this.chatGateway.getCurrentOnlineFriends(myId);
    return { data };
  }
}
