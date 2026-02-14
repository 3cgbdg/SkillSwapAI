import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ReturnDataType } from 'types/general';
import { IChatListItem, IChatResponse } from 'types/chats';
import { Message } from '@prisma/client';
import { ChatsUtils } from 'src/utils/chats.utils';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(
    myId: string,
    friendId: string,
  ): Promise<ReturnDataType<Message[]>> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        users: { every: { id: { in: [myId, friendId] } } },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    return { data: chat?.messages ?? [] };
  }

  async findAll(myId: string): Promise<ReturnDataType<IChatListItem[]>> {
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
        },
        _count: {
          select: {
            messages: {
              where: { toId: myId, isSeen: false },
            },
          },
        },
      },
    });

    return {
      data: chats.map((chat) => ChatsUtils.mapChatListItem(chat, myId)),
    };
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
    }

    const data: IChatResponse = {
      chatId: chat.id,
      friend: { name: dto.friendName, id: dto.friendId },
      lastMessageContent: null,
    };

    return { data };
  }
}
