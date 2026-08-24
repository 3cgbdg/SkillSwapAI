import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { PrismaService } from 'prisma/prisma.service';
import { QUEUE_AI } from 'src/queues/queue.constants';

describe('MatchesService', () => {
  let service: MatchesService;
  let prisma: {
    match: { count: jest.Mock };
    friendship: { count: jest.Mock };
  };
  let queueAdd: jest.Mock;

  beforeEach(async () => {
    prisma = {
      match: { count: jest.fn() },
      friendship: { count: jest.fn() },
    };
    queueAdd = jest.fn().mockResolvedValue({ id: 'job-1' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchesService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === getQueueToken(QUEUE_AI)) return { add: queueAdd };
        if (token === CACHE_MANAGER) return { get: jest.fn(), set: jest.fn() };
        return {};
      })
      .compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enqueueActiveMatch', () => {
    it('rejects generating a training plan with a non-friend', async () => {
      prisma.match.count.mockResolvedValue(0);
      prisma.friendship.count.mockResolvedValue(0);

      await expect(
        service.enqueueActiveMatch('me', 'stranger'),
      ).rejects.toThrow(ForbiddenException);
      expect(queueAdd).not.toHaveBeenCalled();
    });

    it('enqueues generation for an existing friend', async () => {
      prisma.match.count.mockResolvedValue(0);
      prisma.friendship.count.mockResolvedValue(1);

      const result = await service.enqueueActiveMatch('me', 'friend');

      expect(queueAdd).toHaveBeenCalled();
      expect(result.jobId).toBeDefined();
    });

    it('returns a retryable service error when Redis cannot enqueue work', async () => {
      prisma.match.count.mockResolvedValue(0);
      prisma.friendship.count.mockResolvedValue(1);
      queueAdd.mockRejectedValue(new Error('Redis quota exceeded'));

      await expect(service.enqueueActiveMatch('me', 'friend')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
