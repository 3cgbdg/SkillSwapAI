import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { PrismModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismModule],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule { }
