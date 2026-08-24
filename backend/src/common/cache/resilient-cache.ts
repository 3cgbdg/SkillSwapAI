import { Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { ErrorLogThrottle } from '../logging/error-log-throttle';

const logger = new Logger('ResilientCache');
const errorLogThrottle = new ErrorLogThrottle();

function warn(operation: string, key: string, error: unknown): void {
  if (!errorLogThrottle.shouldLog(error)) return;

  const message = error instanceof Error ? error.message : String(error);
  logger.warn(
    `Cache ${operation} failed for ${key}; continuing without cache: ${message}`,
  );
}

export async function cacheGet<T>(
  cacheManager: Cache,
  key: string,
): Promise<T | undefined> {
  try {
    return await cacheManager.get<T>(key);
  } catch (error) {
    warn('read', key, error);
    return undefined;
  }
}

export async function cacheSet(
  cacheManager: Cache,
  key: string,
  value: unknown,
  ttl?: number,
): Promise<void> {
  try {
    await cacheManager.set(key, value, ttl);
  } catch (error) {
    warn('write', key, error);
  }
}

export async function cacheMget<T>(
  cacheManager: Cache,
  keys: string[],
): Promise<Array<T | undefined>> {
  try {
    return await cacheManager.mget<T>(keys);
  } catch (error) {
    warn('multi-read', `${keys.length} keys`, error);
    return keys.map(() => undefined);
  }
}

export async function cacheDel(
  cacheManager: Cache,
  key: string,
): Promise<void> {
  try {
    await cacheManager.del(key);
  } catch (error) {
    warn('delete', key, error);
  }
}
