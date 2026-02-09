import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { PrismModule } from 'prisma/prisma.module';
import { AiModule } from 'src/ai/ai.module';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { ProfilesModule } from 'src/profiles/profiles.module';

@Module({
  imports: [PrismModule, AiModule, ProfilesModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule { }
