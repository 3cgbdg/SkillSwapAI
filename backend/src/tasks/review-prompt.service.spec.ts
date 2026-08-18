import { Test, TestingModule } from '@nestjs/testing';
import { ReviewPromptService } from './review-prompt.service';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';

describe('ReviewPromptService', () => {
  let service: ReviewPromptService;
  let prisma: {
    $queryRaw: jest.Mock;
    $executeRaw: jest.Mock;
    session: { findMany: jest.Mock; updateMany: jest.Mock };
  };
  let notifyReviewPrompt: jest.Mock;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
      session: { findMany: jest.fn(), updateMany: jest.fn() },
    };
    notifyReviewPrompt = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewPromptService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === RequestGateway) return { notifyReviewPrompt };
        return {};
      })
      .compile();

    service = module.get<ReviewPromptService>(ReviewPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does nothing when it cannot acquire the advisory lock', async () => {
    prisma.$queryRaw.mockResolvedValue([{ acquired: false }]);

    await service.runPromptSessionReviews();

    expect(prisma.session.findMany).not.toHaveBeenCalled();
    expect(notifyReviewPrompt).not.toHaveBeenCalled();
  });

  it('notifies both participants of an eligible session and marks it prompted', async () => {
    prisma.$queryRaw.mockResolvedValue([{ acquired: true }]);
    prisma.session.findMany
      .mockResolvedValueOnce([
        {
          id: 'session-1',
          title: 'JavaScript basics',
          users: [{ id: 'user-a' }, { id: 'user-b' }],
        },
      ])
      .mockResolvedValueOnce([]);

    await service.runPromptSessionReviews();

    expect(notifyReviewPrompt).toHaveBeenCalledTimes(2);
    expect(notifyReviewPrompt).toHaveBeenCalledWith(
      'user-a',
      expect.objectContaining({ sessionId: 'session-1' }),
    );
    expect(notifyReviewPrompt).toHaveBeenCalledWith(
      'user-b',
      expect.objectContaining({ sessionId: 'session-1' }),
    );
    expect(prisma.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['session-1'] } },
      }),
    );
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('releases the advisory lock even if the sweep throws', async () => {
    prisma.$queryRaw.mockResolvedValue([{ acquired: true }]);
    prisma.session.findMany.mockRejectedValue(new Error('db unavailable'));

    await expect(service.runPromptSessionReviews()).rejects.toThrow(
      'db unavailable',
    );

    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
