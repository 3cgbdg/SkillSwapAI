import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ChatsService } from './chats.service';
import { PrismaService } from 'prisma/prisma.service';

describe('ChatsService', () => {
  let service: ChatsService;
  let prisma: { chat: { findFirst: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      chat: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === CACHE_MANAGER)
          return { get: jest.fn(), set: jest.fn(), del: jest.fn() };
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
});
