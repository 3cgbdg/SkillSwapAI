import { User } from '@prisma/client';

export interface IFriendItem extends Pick<User, 'id' | 'name' | 'imageUrl'> {}
