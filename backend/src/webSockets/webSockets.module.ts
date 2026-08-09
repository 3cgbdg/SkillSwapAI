import { Module, Global } from '@nestjs/common';
import { RequestGateway } from './request.gateway';
import { ChatGateway } from './chat.gateway';

@Global()
@Module({
  providers: [RequestGateway, ChatGateway],
  exports: [RequestGateway, ChatGateway],
})
export class WebSocketsModule {}
