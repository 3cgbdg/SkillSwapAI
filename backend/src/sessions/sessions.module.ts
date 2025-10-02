import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { PrismModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule { }
