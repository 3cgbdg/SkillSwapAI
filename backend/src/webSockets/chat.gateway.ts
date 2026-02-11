import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrismaService } from 'prisma/prisma.service';
import { Socket, Server } from 'socket.io';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { SocketData } from '../../types/general';
import type { JwtPayload } from '../../types/auth';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }
  @WebSocketServer()
  server: Server;
  async handleConnection(client: Socket<any, any, any, SocketData>) {
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const parsed = cookie.parse(cookies);
      const token = parsed['access_token'];
      if (!token) {
        console.warn('[ChatGateway] Cookie present but access_token missing');
        return client.disconnect();
      }
      try {
        const payload = this.jwtService.verify(token as string, {
          secret: this.configService.get<string>('JWT_SECRET'),
        }) as unknown as JwtPayload;
        client.data.userId = payload.userId;
        await client.join(`user:${payload.userId}`);
        console.log(`[ChatGateway] User ${payload.userId} connected and joined room: user:${payload.userId}`);
        await this.cacheManager.set(`user:online:${payload.userId}`, 1, 80000);
        const currentOnlineFriends = await this.getCurrentOnlineFriends(
          payload.userId,
        );

        client.on('heartbeat', async () => {
          await this.cacheManager.set(
            `user:online:${payload.userId}`,
            1,
            80000,
          );
        });
        for (const friendId of currentOnlineFriends) {
          const isOnline = await this.cacheManager.get<string>(
            `user:online:${friendId}`,
          );
          if (isOnline)
            this.server
              .to(`user:${friendId}`)
              .emit('setToOnline', { id: payload.userId });
        }
      } catch (err: unknown) {
        console.error(
          '[ChatGateway] Connection auth failed:',
          err instanceof Error ? err.message : String(err),
        );
        client.disconnect();
      }
    } else {
      console.warn('[ChatGateway] Connection attempt without cookies');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket<any, any, any, SocketData>) {
    if (client.data.userId) {
      void client.leave(`user:${client.data.userId}`);
    }
  }

  async getCurrentOnlineFriends(id: string): Promise<string[]> {
    const friends1 = await this.prisma.friendship.findMany({
      where: { user1Id: id },
      include: { user2: { select: { id: true, name: true } } },
    });
    const friends2 = await this.prisma.friendship.findMany({
      where: { user2Id: id },
      include: { user1: { select: { id: true, name: true } } },
    });
    const friendsIds = [
      ...friends1.map((item) => item.user2.id),
      ...friends2.map((item) => item.user1.id),
    ];
    const online: string[] = [];

    for (const fid of friendsIds) {
      const value = await this.cacheManager.get(`user:online:${fid}`);
      if (value) online.push(fid);
    }

    return online;
  }

  @SubscribeMessage('updateSeen')
  async updateSeenMessage(client: Socket, payload: { messageId: string }) {
    try {
      const updatedMessage = await this.prisma.message.update({
        where: { id: payload.messageId },
        data: { isSeen: true },
      });
      const isOnline = await this.cacheManager.get<string>(
        `user:online:${updatedMessage.fromId}`,
      );
      if (isOnline) {
        this.server.to(`user:${updatedMessage.fromId}`).emit('updateSeen', {
          messageId: payload.messageId,
        });
      }
    } catch (e) {
      console.error('Failed to update seen message:', e);
    }
  }

  @SubscribeMessage('sendMessage')
  async sendPrivateMessage(
    client: Socket<any, any, any, SocketData>,
    payload: { to: string; message: string },
  ) {
    const fromId = client.data.userId;
    // saving in db
    const chat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { users: { some: { id: fromId } } },
          { users: { some: { id: payload.to } } },
        ],
      },
    });
    let messageId: string;
    if (!chat) {
      const chat = await this.prisma.chat.create({
        data: {
          users: {
            connect: [{ id: fromId }, { id: payload.to }],
          },
          messages: {
            create: {
              fromId: fromId,
              toId: payload.to,
              content: payload.message,
            },
          },
        },
        include: { messages: true },
      });
      messageId = chat.messages[0].id;
      client.emit('messageSent', {
        id: chat.messages[0].id,
        createdAt: chat.messages[0].createdAt,
      });
    } else {
      const message = await this.prisma.message.create({
        data: {
          fromId: fromId,
          toId: payload.to,
          content: payload.message,
          chatId: chat.id,
        },
      });

      client.emit('messageSent', {
        id: message.id,
        createdAt: message.createdAt,
      });

      messageId = message.id;
    }
    //otherwise simply creating new message

    const isOnline = await this.cacheManager.get<string>(
      `user:online:${payload.to}`,
    );

    if (isOnline) {
      this.server.to(`user:${payload.to}`).emit('receiveMessage', {
        from: fromId,
        messageContent: payload.message,
        id: messageId,
      });
    }
  }
}
