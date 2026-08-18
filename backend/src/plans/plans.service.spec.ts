import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PrismaService } from 'prisma/prisma.service';

describe('PlansService', () => {
  let service: PlansService;
  let prisma: {
    match: { findUnique: jest.Mock };
    plan: { findUnique: jest.Mock };
    module: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      match: { findUnique: jest.fn() },
      plan: { findUnique: jest.fn() },
      module: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PlansService],
    })
      .useMocker((token) => (token === PrismaService ? prisma : {}))
      .compile();

    service = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlan', () => {
    it('rejects a caller who is not part of the match', async () => {
      prisma.match.findUnique.mockResolvedValue({
        id: 'match-1',
        initiatorId: 'a',
        otherId: 'b',
        plan: {},
      });

      await expect(service.getPlan('match-1', 'stranger')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns the plan for a match participant', async () => {
      prisma.match.findUnique.mockResolvedValue({
        id: 'match-1',
        initiatorId: 'a',
        otherId: 'b',
        plan: { id: 'plan-1' },
      });

      const result = await service.getPlan('match-1', 'a');
      expect(result.data).toEqual({ id: 'plan-1' });
    });
  });

  describe('updateStatusToCompeted', () => {
    it('rejects a caller who is not part of the underlying match', async () => {
      prisma.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        modules: [{ id: 'mod-1', status: 'INPROGRESS' }],
        match: { initiatorId: 'a', otherId: 'b' },
      });

      await expect(
        service.updateStatusToCompeted('plan-1', 'mod-1', 'stranger'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.module.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a nonexistent plan', async () => {
      prisma.plan.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatusToCompeted('missing', 'mod-1', 'a'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
