import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { PrismaService } from "prisma/prisma.service";
import { Socket, Server } from "socket.io";
import * as cookie from "cookie"
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
    cors: { origin: "*", }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { };
    @WebSocketServer()
    server: Server
    private users = new Map<string, string>() // userid--Socketid
    handleConnection(client: Socket) {
        const cookies = client.handshake.headers.cookie;
        if (cookies) {
            const parsed = cookie.parse(cookies);
            const token = parsed['access_token'];
            const payload = this.jwtService.verify(token as string) as { userId: string };
            this.users.set(payload.userId, client.id);
            client.data.userId = payload.userId;
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.users.entries()) {
            if (socketId === client.id) {
                this.users.delete(userId);
            }
        }
    }

    @SubscribeMessage("sendMessage")
    async sendPrivateMessage(client: Socket, payload: { to: string; message: string }) {
        const socketId = this.users.get(payload.to);
        const fromId = client.data.userId;


        if (socketId) {
            this.server.to(socketId).emit('receiveMessage', {
                from: fromId,
                message: payload.message,
            });
            let chat = await this.prisma.chat.findFirst({
                where: {
                    AND: [
                        { users: { some: { id: fromId } } },
                        { users: { some: { id: payload.to } } },

                    ]
                },
            })
            if (!chat) {
                chat = await this.prisma.chat.create({
                    data: {
                        users: {
                            connect: [
                                { id: fromId },
                                { id: payload.to },
                            ]
                        },
                        messages: {
                            create: {
                                fromId: fromId, toId: payload.to, content: payload.message
                            }
                        }
                    }
                })
            }


        }


    }


}