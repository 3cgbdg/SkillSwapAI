import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'prisma/prisma.service';
import { JwtPayload } from 'types/auth';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ErrorLogThrottle } from 'src/common/logging/error-log-throttle';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  private readonly cacheErrorLogThrottle = new ErrorLogThrottle();

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          (req.cookies as Record<string, string | undefined> | undefined)?.[
            'access_token'
          ] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string }> {
    const cacheKey = `auth:user:${payload.userId}`;
    let cached: { id: string } | undefined;
    try {
      cached = await this.cacheManager.get<{ id: string }>(cacheKey);
    } catch (error) {
      this.logCacheFailure('read', error);
    }
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.cacheManager.set(cacheKey, user, 60_000);
    } catch (error) {
      this.logCacheFailure('write', error);
    }

    return user;
  }

  private logCacheFailure(operation: string, error: unknown): void {
    if (!this.cacheErrorLogThrottle.shouldLog(error)) return;
    this.logger.warn(
      `Authentication cache ${operation} failed; using the database: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
