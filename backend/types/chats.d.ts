import { Message, User } from '@prisma/client';

export interface IChatFriend extends Pick<User, 'id' | 'name' | 'imageUrl'> { }

export interface IChatListItem {
    chatId: string;
    friend: IChatFriend;
    lastMessageContent: string | null;
    _count: {
        id: number;
    };
    lastMessageAt: Date | null;
}

export interface IChatResponse {
    chatId: string;
    friend: { name: string; id: string };
    lastMessageContent: string | null;
}
