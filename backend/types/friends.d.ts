import { User } from '../src/prisma/prisma-exports.js';

export type IFriendItem = Pick<User, 'id' | 'name' | 'imageUrl'>;
