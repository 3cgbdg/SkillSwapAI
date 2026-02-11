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
  ) { }
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket<any, any, any, SocketData>) {
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
      } catch (err: unknown) {
        console.error(
          '[RequestGateway] Connection auth failed:',
          err instanceof Error ? err.message : String(err),
        );
        client.disconnect();
      }
    } else {
      console.warn('[RequestGateway] Connection attempt without cookies');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket<any, any, any, SocketData>) {
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

  notifyAiSuggestions(toId: string, payload: unknown) {
    try {
      const roomName = `user:${toId}`;
      const sockets = this.server.sockets.adapter.rooms.get(roomName);
      const count = sockets ? sockets.size : 0;

      console.log(
        `[RequestGateway] Emitting aiSuggestionsReady to ${roomName}. Sockets in room: ${count}`,
        { hasServer: !!this.server },
      );

      this.server?.to(roomName).emit('aiSuggestionsReady', payload);
    } catch (err) {
      console.error('[RequestGateway] Failed to emit aiSuggestionsReady:', err);
    }
  }
}
