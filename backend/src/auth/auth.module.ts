import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { PrismModule } from 'prisma/prisma.module';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { CookiesService } from './cookies.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismModule, ProfilesModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, CookiesService],
})
export class AuthModule {}
