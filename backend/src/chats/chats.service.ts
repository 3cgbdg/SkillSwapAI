import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ReturnDataType } from 'types/general';
import { IChatListItem, IChatResponse } from 'types/chats';
import { Message } from '../prisma/prisma-exports.js';
import { ChatsUtils } from 'src/utils/chats.utils';
import { CACHE_TTL_LIST_MS, CacheKeys } from 'src/utils/cache-keys';

export type ChatMessage = Pick<
  Message,
  'id' | 'content' | 'fromId' | 'createdAt' | 'isSeen'
>;

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findOne(
    myId: string,
    friendId: string,
  ): Promise<ReturnDataType<ChatMessage[]>> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        users: { every: { id: { in: [myId, friendId] } } },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 200,
          select: {
            id: true,
            content: true,
            fromId: true,
            createdAt: true,
            isSeen: true,
          },
        },
      },
    });

    const messages = chat?.messages ?? [];
    messages.reverse();

    return { data: messages };
  }

  async findAll(myId: string): Promise<ReturnDataType<IChatListItem[]>> {
    const cacheKey = CacheKeys.chatsList(myId);
    const cached =
      await this.cacheManager.get<ReturnDataType<IChatListItem[]>>(cacheKey);
    if (cached) return cached;

    const chats = await this.prisma.chat.findMany({
      where: {
        users: { some: { id: myId } },
      },
      include: {
        users: {
          where: { id: { not: myId } },
          select: { id: true, name: true, imageUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true },
        },
        _count: {
          select: {
            messages: {
              where: { toId: myId, isSeen: false },
            },
          },
        },
      },
      take: 100,
    });

    const result = {
      data: chats.map((chat) => ChatsUtils.mapChatListItem(chat)),
    };
    await this.cacheManager.set(cacheKey, result, CACHE_TTL_LIST_MS);
    return result;
  }

  async createChat(
    dto: CreateChatDto,
    myId: string,
  ): Promise<ReturnDataType<IChatResponse>> {
    let chat = await this.prisma.chat.findFirst({
      where: {
        users: { every: { id: { in: [myId, dto.friendId] } } },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          users: {
            connect: [{ id: myId }, { id: dto.friendId }],
          },
        },
      });
      await Promise.all([
        this.cacheManager.del(CacheKeys.chatsList(myId)),
        this.cacheManager.del(CacheKeys.chatsList(dto.friendId)),
      ]);
    }

    const data: IChatResponse = {
      chatId: chat.id,
      friend: { name: dto.friendName, id: dto.friendId },
      lastMessageContent: null,
    };

    return { data };
  }
}
