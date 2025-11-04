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
import { ScheduleModule } from '@nestjs/schedule';
import { S3Module } from './s3/s3module';
import { PlansModule } from './plans/plans.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [ConfigModule.forRoot({
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
  ScheduleModule.forRoot(),
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

    AiModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
