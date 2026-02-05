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

  // later optimize it
  async findAll(myId: string) {
    const chats = await this.prisma.message.groupBy({
      by: ['chatId'],
      where: {
        OR: [{ fromId: myId }, { toId: myId }],
      },
      _max: { createdAt: true },
      _count: { id: true },
    });
    if (chats.length > 0) {
      const lastMessages = await this.prisma.message.findMany({
        where: {
          OR: [{ fromId: myId }, { toId: myId }],
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['chatId'],
        include: {
          from: { select: { id: true, name: true, imageUrl: true } },
          to: { select: { id: true, name: true, imageUrl: true } },
        },
      });

      const newChats = await Promise.all(
        chats.map(async (chat) => {
          const lastMsg = lastMessages.find((msg) => msg.chatId == chat.chatId);
          if (!lastMsg) {
            return {
              ...chat,
              lastMessageContent: null,
              friend: null,
            };
          }

          const friend = lastMsg.fromId === myId ? lastMsg.to : lastMsg.from;

          return {
            ...chat,
            _count: {
              id: await this.prisma.message.count({
                where: { toId: myId, chatId: chat.chatId, isSeen: false },
              }),
            },
            lastMessageContent: lastMsg.content,
            friend,
          };
        }),
      );

      return newChats;
    } else {
      const chats = await this.prisma.chat.findMany({
        where: { users: { some: { id: myId } } },
        include: {
          users: {
            where: { NOT: { id: myId } },
            select: { id: true, name: true, imageUrl: true },
          },
        },
      });
      const newChats = chats.map((chat) => {
        return {
          chatId: chat.id,
          friend: chat.users[0],
        };
      });
      return newChats;
    }
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
