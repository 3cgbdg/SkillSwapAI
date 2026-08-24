import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CreateFriendDto } from './dto/create-friend.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChatGateway } from 'src/webSockets/chat.gateway';
import { IReturnMessage, ReturnDataType } from 'types/general';
import { IFriendItem } from 'types/friends';

import { UserUtils } from 'src/utils/user.utils';
import { CACHE_TTL_LIST_MS, CacheKeys } from 'src/utils/cache-keys';
import { FriendshipUtils } from 'src/utils/friendship.utils';
import { cacheDel, cacheGet, cacheSet } from 'src/common/cache/resilient-cache';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async create(dto: CreateFriendDto, id: string): Promise<IReturnMessage> {
    const user = await this.prisma.user.findUnique({ where: { id: dto.id } });
    if (!user) throw new NotFoundException('User not found');

    const friendshipExists = await this.doesFriendshipExist(id, dto.id);
    if (friendshipExists) {
      throw new BadRequestException('You are already friends with this user');
    }

    const pendingRequest = await this.prisma.request.findFirst({
      where: { fromId: dto.id, toId: id, type: 'FRIEND' },
    });
    if (!pendingRequest) {
      throw new BadRequestException('No pending friend request from this user');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.friendship.create({
        data: { user1Id: dto.id, user2Id: id },
      });
      await tx.request.deleteMany({
        where: { fromId: dto.id, toId: id, type: 'FRIEND' },
      });
    });

    // Becoming friends changes both users' friends lists and their
    // available-match eligibility (buildAvailableMatchesFilter includes
    // friendOf/friends in its OR criteria).
    await Promise.all([
      cacheDel(this.cacheManager, CacheKeys.friendsList(id)),
      cacheDel(this.cacheManager, CacheKeys.friendsList(dto.id)),
      cacheDel(this.cacheManager, CacheKeys.availableMatches(id)),
      cacheDel(this.cacheManager, CacheKeys.availableMatches(dto.id)),
    ]);

    return { message: `${user.name} successfully added to friends!` };
  }

  // private async cleanupFriendRequests(fromId: string, toId: string) {
  //   await this.prisma.request.deleteMany({
  //     where: { fromId, toId, type: 'FRIEND' },
  //   });
  // }

  async findAll(id: string): Promise<ReturnDataType<IFriendItem[]>> {
    const cacheKey = CacheKeys.friendsList(id);
    const cached = await cacheGet<ReturnDataType<IFriendItem[]>>(
      this.cacheManager,
      cacheKey,
    );
    if (cached) return cached;

    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: id }, { user2Id: id }],
      },
      include: {
        user1: { select: { id: true, name: true, imageUrl: true } },
        user2: { select: { id: true, name: true, imageUrl: true } },
      },
      take: 200,
    });

    const data: IFriendItem[] = friendships.map((f) =>
      UserUtils.getOtherUser(id, f.user1, f.user2),
    );

    const result = { data };
    await cacheSet(this.cacheManager, cacheKey, result, CACHE_TTL_LIST_MS);
    return result;
  }

  async getOnlineFriends(myId: string): Promise<ReturnDataType<string[]>> {
    const data = await this.chatGateway.getCurrentOnlineFriends(myId);
    return { data };
  }

  async doesFriendshipExist(myId: string, otherId: string): Promise<boolean> {
    const friendshipExists = await this.prisma.friendship.count({
      where: FriendshipUtils.buildPairFilter(myId, otherId),
    });
    return friendshipExists > 0;
  }
}
