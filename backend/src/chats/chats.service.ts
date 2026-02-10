import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ReturnDataType } from 'types/general';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) { }

  async findOne(myId: string, friendId: string): Promise<ReturnDataType<any[]>> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { users: { some: { id: myId } } },
          { users: { some: { id: friendId } } },
        ],
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    const data = [...(chat?.messages ?? [])];
    return { data };
  }

  async findAll(myId: string): Promise<ReturnDataType<any>> {
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
              where: {
                toId: myId,
                isSeen: false,
              },
            },
          },
        },
      },
    });
    const data = chats.map((chat) => {
      const lastMsg = chat.messages[0];
      return {
        chatId: chat.id,
        friend: chat.users[0] || null,
        lastMessageContent: lastMsg?.content || null,
        _count: {
          id: chat._count.messages,
        },
        lastMessageAt: lastMsg?.createdAt || null,
      };
    });
    return { data };
  }

  async createChat(
    dto: CreateChatDto,
    myId: string,
  ): Promise<ReturnDataType<any>> {
    let chat = await this.prisma.chat.findFirst({
      where: {
        users: { some: { id: myId } },
        AND: { users: { some: { id: dto.friendId } } },
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
    const data = {
      chatId: chat.id,
      friend: { name: dto.friendName, id: dto.friendId },
      lastMessageContent: null,
    };
    return { data };
  }
}
