import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismModule } from 'prisma/prisma.module';
import { AiController } from './ai.controller';

@Module({
  imports: [PrismModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
