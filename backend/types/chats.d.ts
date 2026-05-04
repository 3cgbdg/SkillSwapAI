import { User } from '../src/prisma/prisma-exports.js';

export type IChatFriend = Pick<User, 'id' | 'name' | 'imageUrl'>;

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
