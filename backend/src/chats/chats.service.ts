import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ChatsService {

  constructor(private readonly prisma: PrismaService) { };

  async findOne(myId: string, friendId: string) {

    const chat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { users: { some: { id: myId } } },
          { users: { some: { id: friendId } } },
        ]
      }, include: { messages: { select: { fromId: true, content: true } } }
    })

    return [...(chat?.messages ?? [])]

  }

// later optimize it 
  async findAll(myId: string) {

    const chats = await this.prisma.message.groupBy({
      by: ['chatId'],
      where: {
        OR: [
          { fromId: myId },
          { toId: myId },
        ],
      },
      _max: { createdAt: true },
      _count: { id: true },
    })
    const lastMessages = await this.prisma.message.findMany({
      where: {
        OR: [
          { fromId: myId },
          { toId: myId },
        ],
        isSeen: false
      }, orderBy: { createdAt: 'desc' }, distinct: ['chatId'], include: {
        from: { select: { id: true, name: true } },
        to: { select: { id: true, name: true } },
      }
    })
    const newChats = chats.map(chat => {
      const lastMsg = lastMessages.find(msg => msg.chatId == chat.chatId);
      if (!lastMsg) return { ...chat, lastMessageContent: null, friend: null };
      const friend = lastMsg.fromId == myId ? lastMsg.to : lastMsg.from;
      return (
        {
          ...chat,
          lastMessageContent: lastMsg.content,
          friend: friend
        })
    })
    console.log(newChats)
    return newChats;

  }

}
