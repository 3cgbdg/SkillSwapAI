import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { buildIoredisOptions } from '../config/redis.config';
import { ErrorLogThrottle } from '../common/logging/error-log-throttle';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private readonly errorLogThrottle = new ErrorLogThrottle();
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(
    app: INestApplication,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const options = buildIoredisOptions(this.configService);
    if (!options) {
      this.logger.warn(
        'REDIS_HOST not set — Socket.IO using in-memory adapter (single instance only)',
      );
      return;
    }

    const pubClient = new Redis(options);
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => {
      if (this.errorLogThrottle.shouldLog(err)) {
        this.logger.error(`Redis pub client error: ${err.message}`);
      }
    });
    subClient.on('error', (err) => {
      if (this.errorLogThrottle.shouldLog(err)) {
        this.logger.error(`Redis sub client error: ${err.message}`);
      }
    });

    try {
      await Promise.all([pubClient.ping(), subClient.ping()]);
    } catch (error) {
      pubClient.disconnect();
      subClient.disconnect();
      this.logger.warn(
        `Socket.IO Redis adapter unavailable; using the in-memory adapter: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return;
    }

    this.adapterConstructor = createAdapter(pubClient, subClient);
    this.logger.log('Socket.IO Redis adapter connected');
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
