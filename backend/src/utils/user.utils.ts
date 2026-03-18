export class UserUtils {
  static getOtherUser<T extends { id: string }>(
    myId: string,
    user1: T | null,
    user2: T | null,
  ): T {
    if (user1?.id === myId) {
      return user2 as T;
    }
    if (user2?.id === myId) {
      return user1 as T;
    }
    return user1 as T;
  }
}
