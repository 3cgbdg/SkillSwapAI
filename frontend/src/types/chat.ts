export interface IFriend {
    name?: string;
    imageUrl: string;
    id: string;
    newMessagesQuantity?: number;
    lastMessage?: { content: string; createdAt: string };
}

export interface IChat {
    _max: { createdAt: string };
    _count: { id: number };
    chatId: string;
    lastMessageContent?: string;
    friend: IFriend;

}

export interface IMessage {
    id: string;
    content: string;
    fromId: string;
    createdAt: Date;
    isSeen: boolean;
}
