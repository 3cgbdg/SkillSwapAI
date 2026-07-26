import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  type HealthIndicatorFunction,
} from '@nestjs/terminus';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get('health/live')
  live() {
    return { status: 'ok' };
  }

  @Get('health')
  @HealthCheck()
  healthLegacy() {
    return this.ready();
  }

  @Get('health/ready')
  @HealthCheck()
  ready() {
    const fastApiUrl = this.configService.get<string>('FASTAPI_URL');
    const checks: HealthIndicatorFunction[] = [
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ];

    if (fastApiUrl) {
      checks.push(() =>
        this.http.pingCheck(
          'fastapi',
          `${fastApiUrl.replace(/\/$/, '')}/health`,
        ),
      );
    }

    return this.health.check(checks);
  }
}
