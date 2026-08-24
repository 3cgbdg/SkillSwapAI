export class FriendshipUtils {
  static buildPairFilter(firstUserId: string, secondUserId: string) {
    return {
      OR: [
        { user1Id: firstUserId, user2Id: secondUserId },
        { user1Id: secondUserId, user2Id: firstUserId },
      ],
    };
  }
}
