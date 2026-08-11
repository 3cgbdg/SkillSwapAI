import { ConfigService } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';
import * as redisStore from 'cache-manager-ioredis';

const DEFAULT_REDIS_PORT = 6379;

function redisRetryStrategy(times: number): number | null {
  if (times > 10) {
    return null;
  }
  return Math.min(times * 200, 2000);
}

function getRedisHost(configService: ConfigService): string | undefined {
  return configService.get<string>('REDIS_HOST');
}

export function buildIoredisOptions(
  configService: ConfigService,
): RedisOptions | null {
  const host = getRedisHost(configService);
  if (!host) {
    return null;
  }

  const port = configService.get<number>('REDIS_PORT') ?? DEFAULT_REDIS_PORT;
  const password = configService.get<string>('REDIS_PASSWORD');
  const useTls = configService.get<string>('REDIS_TLS') === 'true';

  const options: RedisOptions = {
    host,
    port: Number(port),
    maxRetriesPerRequest: null,
    retryStrategy: redisRetryStrategy,
  };

  if (password) {
    options.password = password;
  }

  if (useTls) {
    options.tls = {};
  }

  return options;
}

export function buildCacheManagerRedisConfig(
  configService: ConfigService,
): Record<string, unknown> | { ttl: number } {
  const ioredis = buildIoredisOptions(configService);
  if (!ioredis) {
    return { ttl: 3600 };
  }

  return {
    store: redisStore,
    ttl: 3600,
    ...ioredis,
  };
}
