import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { SkillsModule } from './skills/skills.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    global:true,
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '15m' },
    }),
  }),

    AuthModule,

    SkillsModule,

    SearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
