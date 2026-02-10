import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { PrismModule } from 'prisma/prisma.module';
import { ChatGateway } from 'src/webSockets/chat.gateway';

@Module({
  imports: [PrismModule],
  controllers: [FriendsController],
  providers: [FriendsService, ChatGateway],
  exports: [FriendsService],
})
export class FriendsModule {}
