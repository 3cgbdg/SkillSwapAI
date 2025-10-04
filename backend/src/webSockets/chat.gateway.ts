import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { PrismaService } from "prisma/prisma.service";
import { Socket, Server } from "socket.io";
import * as cookie from "cookie"
import { JwtService } from "@nestjs/jwt";


@WebSocketGateway({
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { };
    @WebSocketServer()
    server: Server
    private users = new Map<string, string>() // userid--Socketid
    async handleConnection(client: Socket) {
        const cookies = client.handshake.headers.cookie;
        if (cookies) {
            const parsed = cookie.parse(cookies);
            const token = parsed['access_token'];
            try {
                const payload = this.jwtService.verify(token as string) as { userId: string };
                this.users.set(payload.userId, client.id);
                client.data.userId = payload.userId;
                const currentOnlineFriends = await this.getCurrentOnlineFriends(payload.userId);
                client.emit("friendsOnline", { users: currentOnlineFriends });
                for (let friendId of currentOnlineFriends) {
                    const friendSocket = this.users.get(friendId);
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
            this.users.delete(userId);
            const currentOnlineFriends = await this.getCurrentOnlineFriends(userId);
            for (let friendId of currentOnlineFriends) {
                const friendSocket = this.users.get(friendId);
                if (friendSocket)
                    this.server.to(friendSocket).emit("setToOffline", { id: userId });

            }
        }
    }

    async getCurrentOnlineFriends(id: string) {
        const friends1 = await this.prisma.friend.findMany({ where: { user1Id: id }, include: { user2: { select: { id: true, name: true, } } } });
        const friends2 = await this.prisma.friend.findMany({ where: { user2Id: id }, include: { user1: { select: { id: true, name: true } } } });
        const friends = [...friends1.map(item => item.user2), ...friends2.map(item => item.user1)];

        return friends
            .map(f => f.id)
            .filter(fid => this.users.has(fid));

    }

    @SubscribeMessage("updateSeen")
    async updateSeenMessage(client: Socket, payload: { messageId: string }) {
        try {
            const updatedMessage = await this.prisma.message.update({ where: { id: payload.messageId }, data: { isSeen: true } });
            const senderSocketId = this.users.get(updatedMessage.fromId);
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


        const socketId = this.users.get(payload.to);


        if (socketId) {
            this.server.to(socketId).emit('receiveMessage', {
                from: fromId,
                messageContent: payload.message,
                id: messageId
            });
        }


    }


}