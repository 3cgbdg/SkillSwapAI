import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { HttpModule } from '@nestjs/axios';
import { PrismModule } from 'prisma/prisma.module';
import { AiController } from './ai.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    PrismModule,
  ],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
