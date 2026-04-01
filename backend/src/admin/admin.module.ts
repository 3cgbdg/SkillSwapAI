import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminSeedService } from './admin-seed.service';

@Module({
  controllers: [AdminController],
  providers: [AdminSeedService],
})
export class AdminModule {}
