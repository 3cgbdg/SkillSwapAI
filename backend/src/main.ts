import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RedisIoAdapter } from './webSockets/redis-io.adapter';

// BullMQ creates several of its own Redis connections internally (one per
// Queue, one per Worker) that we never construct directly, so we can't
// attach an `.on('error', ...)` handler to each of them from app code. Any
// one of them emitting an unhandled 'error' event — e.g. Redis rejecting
// commands because a provider's request quota is exhausted, which is
// exactly what took production down — crashes the whole process by
// default. This is a deliberate last-resort net: log loudly and stay up
// rather than crash-loop, since a degraded-but-running API (matches.utils,
// caching, and the queues themselves already degrade gracefully without
// Redis) is better than not serving any traffic at all. It does not
// silence anything — every hit is logged — and it's not a substitute for
// fixing the underlying Redis outage.
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException] continuing without crashing:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection] continuing without crashing:', reason);
});

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  app.enableShutdownHooks();

  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api', {
    exclude: ['health', 'health/live', 'health/ready'],
  });

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = Number(configService.get<string>('PORT') ?? 5200);
  await app.listen(port, '0.0.0.0');
}

void bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
