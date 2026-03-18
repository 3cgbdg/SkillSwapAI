import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { PrismModule } from 'prisma/prisma.module';
import { RequestsModule } from 'src/requests/requests.module';

@Module({
  imports: [PrismModule, RequestsModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
