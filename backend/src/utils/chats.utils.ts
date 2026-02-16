import { IChatListItem } from 'types/chats';

interface IChatPrismaResult {
  id: string;
  users: { id: string; name: string | null; imageUrl: string | null }[];
  messages: { content: string | null; createdAt: Date }[];
  _count: { messages: number };
}

export class ChatsUtils {
  static mapChatListItem(chat: IChatPrismaResult): IChatListItem {
    const lastMsg = chat.messages?.[0];
    return {
      chatId: chat.id,
      friend: chat.users?.[0] || null,
      lastMessageContent: lastMsg?.content || null,
      _count: {
        id: chat._count?.messages || 0,
      },
      lastMessageAt: lastMsg?.createdAt || null,
    };
  }
}
