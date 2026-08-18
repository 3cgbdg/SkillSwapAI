import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';

describe('RequestsService', () => {
  let service: RequestsService;
  let prisma: { request: { deleteMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      request: {
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestsService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === RequestGateway) return { notifyUser: jest.fn() };
        return {};
      })
      .compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteOne', () => {
    it('scopes the delete to requests the caller sent or received', async () => {
      prisma.request.deleteMany.mockResolvedValue({ count: 1 });

      await service.deleteOne('req-1', 'user-1');

      expect(prisma.request.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'req-1',
          OR: [{ fromId: 'user-1' }, { toId: 'user-1' }],
        },
      });
    });

    it('throws NotFoundException instead of deleting a request the caller is not party to', async () => {
      // Simulates another user's ID: the scoped where clause matches
      // nothing, so Prisma reports zero rows affected.
      prisma.request.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteOne('someone-elses-request', 'attacker'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
