import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
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
  constructor(private readonly jwtService: JwtService) { }
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket<any, any, any, SocketData>) {
    const cookies = client.handshake.headers.cookie;

    if (cookies) {
      const parsed = cookie.parse(cookies);
      const token = parsed['access_token'];
      try {
        const payload = this.jwtService.verify(
          token as string,
        ) as unknown as JwtPayload;
        client.data.userId = payload.userId;
        void client.join(`user:${payload.userId}`);
      } catch (err) {
        client.disconnect();
      }
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket<any, any, any, SocketData>) {
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
}
