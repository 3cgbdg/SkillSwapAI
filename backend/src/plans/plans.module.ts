import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PrismModule } from 'prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PrismModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    })
  ],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule { }
