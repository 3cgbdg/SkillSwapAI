import { Module } from '@nestjs/common';
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
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-ioredis';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        if (!host) {
          console.log('[CacheModule] REDIS_HOST not found, using memory store');
          return {
            ttl: 3600,
          };
        }
        return {
          store: redisStore,
          ttl: 3600,
          tls: true,
          host: host,
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD') || null,
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 25,
      },
    ]),
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
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
