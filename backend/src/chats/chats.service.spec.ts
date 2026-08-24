import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ChatsService } from './chats.service';
import { PrismaService } from 'prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('ChatsService', () => {
  let service: ChatsService;
  let prisma: {
    friendship: { count: jest.Mock };
    chat: { findFirst: jest.Mock; create: jest.Mock };
  };
  let cacheManager: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    prisma = {
      friendship: { count: jest.fn() },
      chat: { findFirst: jest.fn(), create: jest.fn() },
    };
    cacheManager = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === CACHE_MANAGER) return cacheManager;
        return {};
      })
      .compile();

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('requires both participants to independently be members, not just a subset match', async () => {
      prisma.chat.findFirst.mockResolvedValue(null);

      await service.findOne('me', 'friend');

      expect(prisma.chat.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { users: { some: { id: 'me' } } },
              { users: { some: { id: 'friend' } } },
            ],
          },
        }),
      );
    });
  });

  describe('createChat', () => {
    it('rejects chat creation between users who are not friends', async () => {
      prisma.friendship.count.mockResolvedValue(0);

      await expect(
        service.createChat(
          { friendId: 'stranger', friendName: 'Stranger' },
          'me',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.chat.findFirst).not.toHaveBeenCalled();
      expect(prisma.chat.create).not.toHaveBeenCalled();
    });

    it('creates a chat for friends and invalidates both chat-list caches', async () => {
      prisma.friendship.count.mockResolvedValue(1);
      prisma.chat.findFirst.mockResolvedValue(null);
      prisma.chat.create.mockResolvedValue({ id: 'chat-1' });

      await expect(
        service.createChat({ friendId: 'friend', friendName: 'Friend' }, 'me'),
      ).resolves.toEqual({
        data: {
          chatId: 'chat-1',
          friend: { id: 'friend', name: 'Friend' },
          lastMessageContent: null,
        },
      });

      expect(prisma.chat.create).toHaveBeenCalledWith({
        data: {
          users: { connect: [{ id: 'me' }, { id: 'friend' }] },
        },
      });
      expect(cacheManager.del).toHaveBeenCalledTimes(2);
    });
  });
});
