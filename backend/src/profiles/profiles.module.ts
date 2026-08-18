import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismModule } from 'prisma/prisma.module';
import { S3Module } from 'src/s3/s3module';
import { UsersModule } from 'src/users/users.module';
import { ReviewsModule } from 'src/reviews/reviews.module';

@Module({
  imports: [PrismModule, S3Module, UsersModule, ReviewsModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
