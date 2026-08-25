import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { AiJobsService } from 'src/queues/ai-jobs.service';

jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { verifyAsync: jest.Mock; decode: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock } };
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    jwtService = { verifyAsync: jest.fn(), decode: jest.fn() };
    prisma = { user: { findUnique: jest.fn() } };
    cacheManager = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === JwtService) return jwtService;
        if (token === PrismaService) return prisma;
        if (token === ConfigService)
          return { get: jest.fn().mockReturnValue('test-refresh-secret') };
        if (token === AiJobsService) return {};
        if (token === CACHE_MANAGER) return cacheManager;
        return {};
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyRefreshToken', () => {
    it('rejects a token with an invalid or forged signature', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(
        service.verifyRefreshToken('forged.token.here'),
      ).rejects.toThrow(UnauthorizedException);
      // Never even queries for the user once signature verification fails.
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('verifies the signature against the refresh secret, not decode-only', async () => {
      jwtService.verifyAsync.mockResolvedValue({ userId: 'user-1' });
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

      await service.verifyRefreshToken('valid.token.here');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.token.here', {
        secret: 'test-refresh-secret',
      });
    });

    it('rejects a validly-signed token for a since-deleted user', async () => {
      jwtService.verifyAsync.mockResolvedValue({ userId: 'deleted-user' });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyRefreshToken('valid.token.here'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a validly-signed token that was revoked at logout', async () => {
      jwtService.verifyAsync.mockResolvedValue({ userId: 'user-1' });
      cacheManager.get.mockResolvedValue(true);

      await expect(
        service.verifyRefreshToken('logged-out.token.here'),
      ).rejects.toThrow(UnauthorizedException);
      // A revoked token is rejected before ever hitting the DB.
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('allows the token through if the revocation cache is unreachable', async () => {
      jwtService.verifyAsync.mockResolvedValue({ userId: 'user-1' });
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      cacheManager.get.mockRejectedValue(new Error('redis down'));

      await expect(
        service.verifyRefreshToken('valid.token.here'),
      ).resolves.toEqual({ userId: 'user-1' });
    });
  });

  describe('revokeRefreshToken', () => {
    it('blacklists the token hash with a TTL matching its remaining life', async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      jwtService.decode.mockReturnValue({ exp: expiresAt });

      await service.revokeRefreshToken('some.refresh.token');

      expect(cacheManager.set).toHaveBeenCalledTimes(1);
      const [key, value, ttl] = cacheManager.set.mock.calls[0] as [
        string,
        boolean,
        number,
      ];
      expect(key).toMatch(/^auth:revoked-rt:/);
      expect(value).toBe(true);
      // Allow a little slack for the ms between computing expiresAt above
      // and the service's own Date.now() call.
      expect(ttl).toBeGreaterThan(3_590_000);
      expect(ttl).toBeLessThanOrEqual(3_600_000);
    });

    it('does not blacklist a token with no exp claim', async () => {
      jwtService.decode.mockReturnValue({});

      await service.revokeRefreshToken('malformed.token');

      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('does not blacklist an already-expired token', async () => {
      jwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) - 10,
      });

      await service.revokeRefreshToken('expired.token');

      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('does not throw if the cache write fails', async () => {
      jwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      cacheManager.set.mockRejectedValue(new Error('redis down'));

      await expect(
        service.revokeRefreshToken('some.refresh.token'),
      ).resolves.toBeUndefined();
    });
  });

  describe('login', () => {
    it('responds identically (401) whether the email is unknown or the password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      const unknownEmailError = await service
        .login({ email: 'nobody@example.com', password: 'x' })
        .catch((e: unknown) => e);

      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      const wrongPasswordError = await service
        .login({ email: 'real@example.com', password: 'wrong' })
        .catch((e: unknown) => e);

      expect(unknownEmailError).toBeInstanceOf(UnauthorizedException);
      expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
      expect((unknownEmailError as UnauthorizedException).getStatus()).toBe(
        (wrongPasswordError as UnauthorizedException).getStatus(),
      );
    });
  });
});
