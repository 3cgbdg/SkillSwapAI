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
import { Inject, OnApplicationShutdown } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { SocketData } from '../../types/general';
import type { JwtPayload } from '../../types/auth';
import { CacheKeys } from '../utils/cache-keys';
import { FriendshipUtils } from '../utils/friendship.utils';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnApplicationShutdown
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
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
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        }) as unknown as JwtPayload;
        client.data.userId = payload.userId;
        await client.join(`user:${payload.userId}`);
        console.log(
          `[ChatGateway] User ${payload.userId} connected and joined room: user:${payload.userId}`,
        );
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

  onApplicationShutdown() {
    this.server?.disconnectSockets(true);
  }

  async getCurrentOnlineFriends(id: string): Promise<string[]> {
    const [friends1, friends2] = await Promise.all([
      this.prisma.friendship.findMany({
        where: { user1Id: id },
        select: { user2Id: true },
      }),
      this.prisma.friendship.findMany({
        where: { user2Id: id },
        select: { user1Id: true },
      }),
    ]);
    const friendsIds = [
      ...friends1.map((item) => item.user2Id),
      ...friends2.map((item) => item.user1Id),
    ];

    if (friendsIds.length === 0) return [];

    const keys = friendsIds.map((fid) => `user:online:${fid}`);
    const values = await this.cacheManager.mget<number>(keys);
    return friendsIds.filter((_, i) => values[i]);
  }

  @SubscribeMessage('updateSeen')
  async updateSeenMessage(
    client: Socket<any, any, any, SocketData>,
    payload: { messageId: string },
  ) {
    const myId = client.data.userId;
    if (!myId) return;

    try {
      // Only the recipient of a message can mark it as seen — scoping the
      // update by toId prevents an unrelated client from tampering with
      // read-receipt state on messages it isn't party to.
      const { count } = await this.prisma.message.updateMany({
        where: { id: payload.messageId, toId: myId },
        data: { isSeen: true },
      });
      if (count === 0) return;

      const updatedMessage = await this.prisma.message.findUnique({
        where: { id: payload.messageId },
      });
      if (!updatedMessage) return;

      await this.cacheManager.del(CacheKeys.chatsList(updatedMessage.toId));
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

  @SubscribeMessage('typing')
  async handleTyping(
    client: Socket<any, any, any, SocketData>,
    payload: { to: string },
  ) {
    const fromId = client.data.userId;
    if (!fromId || !payload?.to) return;
    if (!(await this.areFriends(fromId, payload.to))) return;
    this.server.to(`user:${payload.to}`).emit('typing', { from: fromId });
  }

  @SubscribeMessage('stopTyping')
  async handleStopTyping(
    client: Socket<any, any, any, SocketData>,
    payload: { to: string },
  ) {
    const fromId = client.data.userId;
    if (!fromId || !payload?.to) return;
    if (!(await this.areFriends(fromId, payload.to))) return;
    this.server.to(`user:${payload.to}`).emit('stopTyping', { from: fromId });
  }

  @SubscribeMessage('sendMessage')
  async sendPrivateMessage(
    client: Socket<any, any, any, SocketData>,
    payload: { to: string; message: string },
  ) {
    const fromId = client.data.userId;
    if (!fromId || !payload?.to || !payload?.message?.trim()) return;
    if (!(await this.areFriends(fromId, payload.to))) {
      client.emit('messageError', {
        message: 'You can only message friends',
      });
      return;
    }

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

    await Promise.all([
      this.cacheManager.del(CacheKeys.chatsList(fromId)),
      this.cacheManager.del(CacheKeys.chatsList(payload.to)),
    ]);

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

  private async areFriends(
    firstUserId: string,
    secondUserId: string,
  ): Promise<boolean> {
    if (firstUserId === secondUserId) return false;
    const count = await this.prisma.friendship.count({
      where: FriendshipUtils.buildPairFilter(firstUserId, secondUserId),
    });
    return count > 0;
  }
}
