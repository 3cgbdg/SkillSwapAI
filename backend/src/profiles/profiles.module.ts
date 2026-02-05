import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismModule } from 'prisma/prisma.module';
import { S3Module } from 'src/s3/s3module';

@Module({
  imports: [PrismModule, S3Module],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
