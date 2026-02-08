import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(myId: string, friendId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { users: { some: { id: myId } } },
          { users: { some: { id: friendId } } },
        ],
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    return [...(chat?.messages ?? [])];
  }

  async findAll(myId: string) {
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
    return chats.map((chat) => {
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
  }

  async createChat(dto: CreateChatDto, myId: string) {
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
    return {
      chat: {
        chatId: chat.id,
        friend: { name: dto.friendName, id: dto.friendId },
        lastMessageContent: null,
      },
    };
  }
}
