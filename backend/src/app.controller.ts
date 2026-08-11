import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  type HealthIndicatorFunction,
} from '@nestjs/terminus';
import { PrismaService } from 'prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
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
    const checks: HealthIndicatorFunction[] = [
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ];

    return this.health.check(checks);
  }
}
