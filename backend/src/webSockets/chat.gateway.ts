import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { PrismaService } from "prisma/prisma.service";
import { Socket, Server } from "socket.io";
import * as cookie from "cookie"
import { JwtService } from "@nestjs/jwt";
import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";


@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true
    }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { };
    @WebSocketServer()
    server: Server
    async handleConnection(client: Socket) {

        const cookies = client.handshake.headers.cookie;
        if (cookies) {
            const parsed = cookie.parse(cookies);
            const token = parsed['access_token'];
            try {
                const payload = this.jwtService.verify(token as string) as { userId: string };
                client.data.userId = payload.userId;
                client.join(`user:${payload.userId}`);
                await this.cacheManager.set(
                    `user:online:${payload.userId}`,
                    1,
                    180
                );
                console.log('Setting online:', payload.userId);
                const currentOnlineFriends = await this.getCurrentOnlineFriends(payload.userId);




                client.on('heartbeat', async () => {
                    await this.cacheManager.set(`user:online:${payload.userId}`, 1, 180);
                    console.log('heartbeat',payload.userId);
                });
                for (let friendId of currentOnlineFriends) {
                    const isOnline = await this.cacheManager.get<string>(`user:online:${friendId}`);
                    if (isOnline)
                        this.server.to(`user:${friendId}`).emit("setToOnline", { id: payload.userId });
                }
            }
            catch (err) {
                console.error("Error");
                client.disconnect();
            }

        }
    }

    async handleDisconnect(client: Socket) {

    }

    async getCurrentOnlineFriends(id: string): Promise<string[]> {
        const friends1 = await this.prisma.friendship.findMany({ where: { user1Id: id }, include: { user2: { select: { id: true, name: true, } } } });
        const friends2 = await this.prisma.friendship.findMany({ where: { user2Id: id }, include: { user1: { select: { id: true, name: true } } } });
        const friendsIds = [...friends1.map(item => item.user2.id), ...friends2.map(item => item.user1.id)];
        const online: string[] = [];

        for (const fid of friendsIds) {
            const value = await this.cacheManager.get(`user:online:${fid}`);
            console.log(`fid: ${fid}, value:`, value);
            if (value) online.push(fid);
        }


        return online;

    }

    @SubscribeMessage("updateSeen")
    async updateSeenMessage(client: Socket, payload: { messageId: string }) {
        try {
            const updatedMessage = await this.prisma.message.update({ where: { id: payload.messageId }, data: { isSeen: true } });
            const isOnline = await this.cacheManager.get<string>(`user:online:${updatedMessage.fromId}`);
            if (isOnline) {
                this.server.to(`user:${updatedMessage.fromId}`).emit('updateSeen', {
                    messageId: payload.messageId
                });
            }
        }
        catch (e) {
            console.error("Failed to update seen message:", e);
        }
    }

    @SubscribeMessage("sendMessage")
    async sendPrivateMessage(client: Socket, payload: { to: string; message: string }) {
        const fromId = client.data.userId;
        // saving in db
        let chat = await this.prisma.chat.findFirst({
            where: {
                AND: [
                    { users: { some: { id: fromId } } },
                    { users: { some: { id: payload.to } } },

                ]
            },
        })
        let messageId;
        if (!chat) {
            const chat = await this.prisma.chat.create({
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
                },
                include: { messages: true }
            })
            messageId = chat.messages[0].id;
            client.emit('messageSent', {
                id: chat.messages[0].id,
                createdAt: chat.messages[0].createdAt,
            });

        } else {

            const message = await this.prisma.message.create({ data: { fromId: fromId, toId: payload.to, content: payload.message, chatId: chat.id } })

            client.emit('messageSent', {
                id: message.id,
                createdAt: message.createdAt,
            });

            messageId = message.id;

        }
        //otherwise simply creating new message 


        const isOnline = await this.cacheManager.get<string>(`user:online:${payload.to}`);


        if (isOnline) {
            this.server.to(`user:${payload.to}`).emit('receiveMessage', {
                from: fromId,
                messageContent: payload.message,
                id: messageId
            });
        }


    }


}