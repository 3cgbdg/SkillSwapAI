import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { PrismaService } from 'prisma/prisma.service';
import { ChatGateway } from 'src/webSockets/chat.gateway';

describe('FriendsService', () => {
  let service: FriendsService;
  let prisma: {
    user: { findUnique: jest.Mock };
    friendship: { count: jest.Mock };
    request: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      friendship: { count: jest.fn() },
      request: { findFirst: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendsService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === ChatGateway) return {};
        if (token === CACHE_MANAGER)
          return { get: jest.fn(), set: jest.fn(), del: jest.fn() };
        return {};
      })
      .compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('rejects forcing a friendship when the other user never sent a request', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'target', name: 'Bob' });
      prisma.friendship.count.mockResolvedValue(0);
      prisma.request.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ id: 'target' }, 'attacker'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates the friendship when a pending request from that user exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'target', name: 'Bob' });
      prisma.friendship.count.mockResolvedValue(0);
      prisma.request.findFirst.mockResolvedValue({
        id: 'req-1',
        fromId: 'target',
        toId: 'me',
        type: 'FRIEND',
      });
      prisma.$transaction.mockResolvedValue(undefined);

      const result = await service.create({ id: 'target' }, 'me');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.message).toContain('Bob');
    });
  });
});
