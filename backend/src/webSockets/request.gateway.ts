import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import type { JwtPayload } from '../../types/auth';
import type { SocketData } from '../../types/general';
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class RequestGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket<any, any, any, SocketData>) {
    console.log(`[RequestGateway] New connection attempt: ${client.id}`);
    const cookies = client.handshake.headers.cookie;

    if (cookies) {
      const parsed = cookie.parse(cookies);
      const token = parsed['access_token'];
      if (!token) {
        console.warn('[RequestGateway] Cookie present but access_token missing');
        return client.disconnect();
      }
      try {
        const payload = this.jwtService.verify(token as string, {
          secret: this.configService.get<string>('JWT_SECRET'),
        }) as unknown as JwtPayload;
        client.data.userId = payload.userId;
        await client.join(`user:${payload.userId}`);
        console.log(
          `[RequestGateway] User ${payload.userId} connected and joined room: user:${payload.userId}`,
        );

        // check for pending AI suggestions
        const pendingKey = `pending_ai_suggestions:${payload.userId}`;
        const pendingData = await this.cacheManager.get(pendingKey);
        if (pendingData) {
          this.server.to(`user:${payload.userId}`).emit('aiSuggestionsReady', pendingData);
          await this.cacheManager.del(pendingKey);
        }
      } catch (err: unknown) {
        console.error(
          '[RequestGateway] Connection auth failed:',
          err instanceof Error ? err.message : String(err),
        );
        client.disconnect();
      }
    } else {
      console.warn('[RequestGateway] Connection attempt without cookies from:', client.id);
      client.disconnect();
    }

    client.on('ping', () => {
      console.log(`[RequestGateway] Received ping from client: ${client.id}`);
      client.emit('pong');
    });
  }

  handleDisconnect(client: Socket<any, any, any, SocketData>) {
    console.log(`[RequestGateway] Client disconnected: ${client.id}, userId: ${client.data.userId}`);
    if (client.data.userId) {
      void client.leave(`user:${client.data.userId}`);
    }
  }

  notifyUser(toId: string, payload: unknown) {
    this.server.to(`user:${toId}`).emit('friendRequest', payload);
  }

  notifyUserSession(toId: string, payload: unknown) {
    this.server.to(`user:${toId}`).emit('sessionCreationRequest', payload);
  }

  notifyUserAcceptedSession(toId: string, payload: unknown) {
    this.server.to(`user:${toId}`).emit('sessionAcceptedRequest', payload);
  }
  notifyUserRejectedSession(toId: string, payload: unknown) {
    this.server.to(`user:${toId}`).emit('sessionRejectedRequest', payload);
  }

  async notifyAiSuggestions(toId: string, payload: unknown) {
    try {
      const roomName = `user:${toId}`;
      const sockets = this.server.sockets.adapter.rooms.get(roomName);
      const count = sockets ? sockets.size : 0;

      if (count > 0) {
        this.server.to(roomName).emit('aiSuggestionsReady', payload);
      } else {
        const pendingKey = `pending_ai_suggestions:${toId}`;
        await this.cacheManager.set(pendingKey, payload, 3600 * 1000); // 1 hour TTL
      }
    } catch (err) {
      console.error('[RequestGateway] Failed to notify AI suggestions:', err);
    }
  }
}
