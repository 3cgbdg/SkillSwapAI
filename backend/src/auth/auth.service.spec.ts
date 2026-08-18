import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { AiJobsService } from 'src/queues/ai-jobs.service';

jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { verifyAsync: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    jwtService = { verifyAsync: jest.fn() };
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === JwtService) return jwtService;
        if (token === PrismaService) return prisma;
        if (token === ConfigService)
          return { get: jest.fn().mockReturnValue('test-refresh-secret') };
        if (token === AiJobsService) return {};
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
