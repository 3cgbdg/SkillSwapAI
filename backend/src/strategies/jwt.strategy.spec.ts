import { Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const cache = { get: jest.fn(), set: jest.fn() };
  const prisma = { user: { findUnique: jest.fn() } };
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    strategy = new JwtStrategy(
      {
        get: jest.fn().mockReturnValue('test-secret'),
      } as unknown as ConfigService,
      prisma as unknown as PrismaService,
      cache as unknown as Cache,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a cached user without querying the database', async () => {
    cache.get.mockResolvedValue({ id: 'user-1' });

    await expect(strategy.validate({ userId: 'user-1' })).resolves.toEqual({
      id: 'user-1',
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('falls back to the database when Redis cache reads and writes fail', async () => {
    cache.get.mockRejectedValue(new Error('Redis unavailable'));
    cache.set.mockRejectedValue(new Error('Redis unavailable'));
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(strategy.validate({ userId: 'user-1' })).resolves.toEqual({
      id: 'user-1',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true },
    });
  });

  it('still rejects a deleted user when Redis is unavailable', async () => {
    cache.get.mockRejectedValue(new Error('Redis unavailable'));
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate({ userId: 'missing' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
