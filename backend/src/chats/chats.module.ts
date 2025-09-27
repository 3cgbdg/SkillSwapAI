import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatGateway } from 'src/webSockets/chat.gateway';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService,ChatGateway],
})
export class ChatsModule {}
