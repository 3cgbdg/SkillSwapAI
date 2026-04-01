import {
  Controller,
  Post,
  Headers,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminSeedService } from './admin-seed.service';

@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly seedService: AdminSeedService,
  ) {}

  /**
   * POST /admin/seed
   * Header: x-admin-key: <ADMIN_SECRET>
   *
   * Seeds the database with 150 bot users and ~100 skills.
   * Protected by ADMIN_SECRET env var.
   */
  @Post('seed')
  async seedBots(
    @Headers('x-admin-key') adminKey: string,
  ) {
    const secret = this.configService.get<string>('ADMIN_SECRET');
    if (!secret || adminKey !== secret) {
      this.logger.warn('Unauthorized seed attempt');
      throw new ForbiddenException('Invalid admin key');
    }

    this.logger.log('Admin seed requested — starting...');
    const result = await this.seedService.seed();
    return result;
  }
}
