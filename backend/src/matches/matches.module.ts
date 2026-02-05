import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismModule } from 'prisma/prisma.module';
import { PlansModule } from 'src/plans/plans.module';
import { AiModule } from 'src/ai/ai.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [PrismModule, PlansModule, AiModule, FriendsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
