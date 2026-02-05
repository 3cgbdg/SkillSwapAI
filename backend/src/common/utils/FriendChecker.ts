import { Prisma, User } from '@prisma/client';

// type for users including fields: friendOf and friends
type UserWithFriends = Prisma.UserGetPayload<{
  include: { friends: true; friendOf: true };
}>;

export class FriendChecker {
  private friendIdsSet: Set<string>;
  private friendOfIdsSet: Set<string>;

  constructor(user: UserWithFriends) {
    this.friendIdsSet = new Set(user.friends.map((f) => f.user2Id));
    this.friendOfIdsSet = new Set(user.friendOf.map((f) => f.user1Id));
  }

  isFriend(user2: User): boolean {
    const isFriend =
      this.friendIdsSet.has(user2.id) || this.friendOfIdsSet.has(user2.id);
    return isFriend;
  }
}
