import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule { }
