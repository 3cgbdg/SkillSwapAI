import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { SkillsModule } from './skills/skills.module';
import { SearchModule } from './search/search.module';
import { ChatsModule } from './chats/chats.module';
import { RequestsModule } from './requests/requests.module';
import { FriendsModule } from './friends/friends.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SessionsModule } from './sessions/sessions.module';
import { MatchesModule } from './matches/matches.module';
import { S3Module } from './s3/s3module';
import { PlansModule } from './plans/plans.module';
import { AiModule } from './ai/ai.module';
import { WebSocketsModule } from './webSockets/webSockets.module';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { ResilientThrottlerGuard } from './common/guards/resilient-throttler.guard';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { QueuesModule } from './queues/queues.module';
import {
  buildCacheManagerRedisConfig,
  buildIoredisOptions,
} from './config/redis.config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        quietReqLogger: true,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TerminusModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    QueuesModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        if (!host) {
          console.log('[CacheModule] REDIS_HOST not found, using memory store');
        }
        return buildCacheManagerRedisConfig(configService);
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const throttlers = [
          { name: 'short', ttl: seconds(10), limit: 3 },
          { name: 'medium', ttl: seconds(60), limit: 25 },
          { name: 'long', ttl: seconds(3600), limit: 100 },
        ];

        const redisOptions = buildIoredisOptions(configService);
        if (!redisOptions) {
          return { throttlers };
        }

        const throttlerRedisClient = new Redis(redisOptions);
        throttlerRedisClient.on('error', (err) =>
          new Logger('ThrottlerStorageRedis').error(
            `Redis error: ${err.message}`,
          ),
        );

        return {
          throttlers,
          storage: new ThrottlerStorageRedisService(throttlerRedisClient),
        };
      },
    }),
    AuthModule,
    S3Module,
    SkillsModule,
    SearchModule,
    ChatsModule,
    RequestsModule,
    FriendsModule,
    ProfilesModule,
    SessionsModule,
    MatchesModule,
    PlansModule,
    AiModule,
    WebSocketsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ResilientThrottlerGuard,
    },
  ],
})
export class AppModule {}
