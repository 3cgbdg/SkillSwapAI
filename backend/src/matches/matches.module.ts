import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismModule } from 'prisma/prisma.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [PrismModule, FriendsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
