import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule { }
