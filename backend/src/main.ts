import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { RedisIoAdapter } from './webSockets/redis-io.adapter';

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  app.enableShutdownHooks();

  const redisIoAdapter = new RedisIoAdapter(app, configService);
  redisIoAdapter.connectToRedis();
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

  app.useGlobalInterceptors(new LoggerInterceptor());

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = Number(configService.get<string>('PORT') ?? 5200);
  await app.listen(port, '0.0.0.0');
  // #region agent log
  fetch('http://127.0.0.1:7877/ingest/c055a23c-4c84-4eb5-84c0-8abae4e46ddd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'ee6149',
    },
    body: JSON.stringify({
      sessionId: 'ee6149',
      hypothesisId: 'H-backend-boot',
      location: 'main.ts:bootstrap',
      message: 'API listening',
      data: { port, globalPrefix: 'api' },
      timestamp: Date.now(),
      runId: 'post-fix',
    }),
  }).catch(() => {});
  // #endregion
}

void bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
