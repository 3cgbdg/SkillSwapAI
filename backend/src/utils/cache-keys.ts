export const CACHE_TTL_LIST_MS = 45_000;

export const CacheKeys = {
  availableMatches: (userId: string) => `matches:available:${userId}`,
  activeMatches: (userId: string) => `matches:active:${userId}`,
  friendsList: (userId: string) => `friends:list:${userId}`,
  chatsList: (userId: string) => `chats:list:${userId}`,
};
