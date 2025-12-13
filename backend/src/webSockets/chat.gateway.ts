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
                const currentOnlineFriends = await this.getCurrentOnlineFriends(payload.userId);
                await this.cacheManager.set(`user:online:${payload.userId}`, client.id, 60);
                client.on('heartbeat', async () => {
                    await this.cacheManager.set(`user:online:${payload.userId}`, client.id, 60);
                });
                client.emit("friendsOnline", { users: currentOnlineFriends });
                for (let friendId of currentOnlineFriends) {
                    const friendSocket = await this.cacheManager.get<string>(`user:online:${friendId}`);
                    if (friendSocket)
                        this.server.to(friendSocket).emit("setToOnline", { id: payload.userId });
                }
            }
            catch (err) {
                console.error("Error");
                client.disconnect();
            }

        }
    }

    async handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            await this.cacheManager.del(`user:online:${userId}`);
            const currentOnlineFriends = await this.getCurrentOnlineFriends(userId);
            for (let friendId of currentOnlineFriends) {
                const friendSocket = await this.cacheManager.get<string>(`user:online:${friendId}`);
                if (friendSocket)
                    this.server.to(friendSocket).emit("setToOffline", { id: userId });

            }
        }
    }

    async getCurrentOnlineFriends(id: string) {
        const friends1 = await this.prisma.friendship.findMany({ where: { user1Id: id }, include: { user2: { select: { id: true, name: true, } } } });
        const friends2 = await this.prisma.friendship.findMany({ where: { user2Id: id }, include: { user1: { select: { id: true, name: true } } } });
        const friendIds = [...friends1.map(item => item.user2.id), ...friends2.map(item => item.user1.id)];

        const online: string[] = [];

        for (const fid of friendIds) {
            if (await this.cacheManager.get(`user:online:${fid}`)) {
                online.push(fid);
            }
        }

        return online;

    }

    @SubscribeMessage("updateSeen")
    async updateSeenMessage(client: Socket, payload: { messageId: string }) {
        try {
            const updatedMessage = await this.prisma.message.update({ where: { id: payload.messageId }, data: { isSeen: true } });
            const senderSocketId = await this.cacheManager.get<string>(`user:online:${updatedMessage.fromId}`);
            if (senderSocketId) {
                this.server.to(senderSocketId).emit('updateSeen', {
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


        const socketId = await this.cacheManager.get<string>(`user:online:${payload.to}`);


        if (socketId) {
            this.server.to(socketId).emit('receiveMessage', {
                from: fromId,
                messageContent: payload.message,
                id: messageId
            });
        }


    }


}