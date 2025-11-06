import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { PrismModule } from 'prisma/prisma.module';
import { AiModule } from 'src/ai/ai.module';


@Module({
  imports: [PrismModule, AiModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
