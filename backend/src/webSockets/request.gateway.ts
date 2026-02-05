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
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly jwtService: JwtService) {}
  @WebSocketServer()
  server: Server;
  private users = new Map<string, string>(); // userid--Socketid
  handleConnection(client: Socket<any, any, any, SocketData>) {
    const cookies = client.handshake.headers.cookie;

    if (cookies) {
      const parsed = cookie.parse(cookies);
      const token = parsed['access_token'];
      try {
        const payload = this.jwtService.verify(
          token as string,
        ) as unknown as JwtPayload;
        this.users.set(payload.userId, client.id);
        client.data.userId = payload.userId;
      } catch {
        console.error('Error');
        client.disconnect();
      }
    }
  }

  handleDisconnect(client: Socket<any, any, any, SocketData>) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
      }
    }
  }

  notifyUser(toId: string, payload: unknown) {
    const socketId = this.users.get(toId);
    if (socketId) {
      this.server.to(socketId).emit('friendRequest', payload);
    }
  }

  notifyUserSession(toId: string, payload: unknown) {
    const socketId = this.users.get(toId);
    if (socketId) {
      this.server.to(socketId).emit('sessionCreationRequest', payload);
    }
  }

  notifyUserAcceptedSession(toId: string, payload: unknown) {
    const socketId = this.users.get(toId);
    if (socketId) {
      this.server.to(socketId).emit('sessionAcceptedRequest', payload);
    }
  }
  notifyUserRejectedSession(toId: string, payload: unknown) {
    const socketId = this.users.get(toId);
    if (socketId) {
      this.server.to(socketId).emit('sessionRejectedRequest', payload);
    }
  }
}
