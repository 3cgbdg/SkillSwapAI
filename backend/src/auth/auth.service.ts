import {
  ConflictException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AiJobsService } from 'src/queues/ai-jobs.service';
import { JwtPayload, Tokens } from 'types/auth';
import { AuthUtils } from 'src/utils/auth.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

const REVOKED_TOKEN_PREFIX = 'auth:revoked-rt:';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly aiJobsService: AiJobsService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async signup(dto: CreateAuthDto): Promise<Tokens> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.ensureUserDoesNotExist(dto.name, dto.email);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        password: hashedPassword,
        email: dto.email,
        knownSkills: {
          connectOrCreate: dto.knownSkills.map((title) => ({
            where: { title },
            create: { title },
          })),
        },
        skillsToLearn: {
          connectOrCreate: dto.skillsToLearn.map((title) => ({
            where: { title },
            create: { title },
          })),
        },
      },
    });

    if (!user) throw new InternalServerErrorException('Error creating user');

    void this.aiJobsService.enqueueSkillSuggestions(user.id);

    return AuthUtils.generateTokens(
      user.id,
      this.jwtService,
      this.configService,
    );
  }

  private async ensureUserDoesNotExist(name: string, email: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ name }, { email }] },
    });

    if (user) {
      if (user.name === name)
        throw new ConflictException('Name already exists');
      if (user.email === email)
        throw new ConflictException('Email already exists');
    }
  }

  loginWithUser(userId: string): Tokens {
    return AuthUtils.generateTokens(
      userId,
      this.jwtService,
      this.configService,
    );
  }

  async login(dto: LoginAuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return AuthUtils.generateTokens(
      user.id,
      this.jwtService,
      this.configService,
    );
  }

  createAccessToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (await this.isRefreshTokenRevoked(token)) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return payload;
  }

  // Logout only clears cookies client-side; a refresh token captured before
  // logout (device left unattended, log exposure, etc.) would otherwise stay
  // valid for its full 7-day life. Record its hash here so verifyRefreshToken
  // rejects it going forward, TTL'd to exactly the token's own remaining
  // life so the blacklist entry never outlives what it's blocking.
  async revokeRefreshToken(token: string): Promise<void> {
    const decoded = this.jwtService.decode<{ exp?: number }>(token);
    const expiresAt = decoded?.exp;
    if (!expiresAt) return;

    const ttlMs = expiresAt * 1000 - Date.now();
    if (ttlMs <= 0) return;

    try {
      await this.cacheManager.set(
        REVOKED_TOKEN_PREFIX + this.hashToken(token),
        true,
        ttlMs,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to record refresh token revocation: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async isRefreshTokenRevoked(token: string): Promise<boolean> {
    try {
      return Boolean(
        await this.cacheManager.get(
          REVOKED_TOKEN_PREFIX + this.hashToken(token),
        ),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to check refresh token revocation; allowing through: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
