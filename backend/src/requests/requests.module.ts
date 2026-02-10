import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { PrismModule } from 'prisma/prisma.module';
import { RequestGateway } from 'src/webSockets/request.gateway';

@Module({
  imports: [PrismModule],
  controllers: [RequestsController],
  providers: [RequestsService, RequestGateway],
  exports: [RequestsService],
})
export class RequestsModule {}
