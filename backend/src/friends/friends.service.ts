import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChatGateway } from 'src/webSockets/chat.gateway';
import { IReturnMessage, ReturnDataType } from 'types/general';
import { IFriendItem } from 'types/friends';

import { UserUtils } from 'src/utils/user.utils';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) {}
  async create(dto: CreateFriendDto, id: string): Promise<IReturnMessage> {
    const user = await this.prisma.user.findUnique({ where: { id: dto.id } });
    if (!user) throw new NotFoundException('User not found');

    const friendshipExists = await this.doesFriendshipExist(id, dto.id);
    if (friendshipExists) {
      throw new BadRequestException('You are already friends with this user');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.friendship.create({
        data: { user1Id: dto.id, user2Id: id },
      });
      await tx.request.deleteMany({
        where: { fromId: dto.id, toId: id, type: 'FRIEND' },
      });
    });

    return { message: `${user.name} successfully added to friends!` };
  }

  // private async cleanupFriendRequests(fromId: string, toId: string) {
  //   await this.prisma.request.deleteMany({
  //     where: { fromId, toId, type: 'FRIEND' },
  //   });
  // }

  async findAll(id: string): Promise<ReturnDataType<IFriendItem[]>> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: id }, { user2Id: id }],
      },
      include: {
        user1: { select: { id: true, name: true, imageUrl: true } },
        user2: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    const data: IFriendItem[] = friendships.map(
      (f) => UserUtils.getOtherUser(id, f.user1, f.user2) as IFriendItem,
    );

    return { data };
  }

  async getOnlineFriends(myId: string): Promise<ReturnDataType<string[]>> {
    const data = await this.chatGateway.getCurrentOnlineFriends(myId);
    return { data };
  }

  async doesFriendshipExist(myId: string, otherId: string): Promise<boolean> {
    const friendshipExists = await this.prisma.friendship.count({
      where: {
        OR: [
          { user1Id: myId, user2Id: otherId },
          { user2Id: myId, user1Id: otherId },
        ],
      },
    });
    return friendshipExists > 0;
  }
}
