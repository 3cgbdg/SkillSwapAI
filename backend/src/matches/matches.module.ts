import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismModule } from 'prisma/prisma.module';
import {HttpModule} from '@nestjs/axios'

@Module({
  imports:[PrismModule,
  HttpModule.register({
    timeout:30000,
    maxRedirects:5,
  })
  ],
  controllers: [MatchesController,],
  providers: [MatchesService],
})
export class MatchesModule {}
