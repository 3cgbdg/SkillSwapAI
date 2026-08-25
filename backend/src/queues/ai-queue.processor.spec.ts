import { ForbiddenException, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import type { AiService } from 'src/ai/ai.service';
import type { PlansService } from 'src/plans/plans.service';
import type { PrismaService } from 'prisma/prisma.service';
import type { RequestGateway } from 'src/webSockets/request.gateway';
import type { Cache } from 'cache-manager';
import { AiQueueProcessor } from './ai-queue.processor';
import {
  JOB_AI_SKILL_SUGGESTIONS,
  AiSkillSuggestionsJobPayload,
} from './queue.constants';

describe('AiQueueProcessor.processSkillSuggestions', () => {
  const aiService = { getAiSuggestionSkills: jest.fn() };
  let processor: AiQueueProcessor;

  const makeJob = (userId = 'user-1'): Job<AiSkillSuggestionsJobPayload> =>
    ({
      id: 'job-1',
      name: JOB_AI_SKILL_SUGGESTIONS,
      data: { userId },
    }) as unknown as Job<AiSkillSuggestionsJobPayload>;

  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    processor = new AiQueueProcessor(
      aiService as unknown as AiService,
      {} as PlansService,
      {} as PrismaService,
      {} as RequestGateway,
      {} as Cache,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('completes the job without throwing when the 24h regeneration cooldown is still active', async () => {
    aiService.getAiSuggestionSkills.mockRejectedValue(
      new ForbiddenException('Wait 24 hours to regenerate skills.'),
    );

    // Must not reject: this is an expected, deterministic rejection (not a
    // transient failure), so BullMQ should mark the job done rather than
    // retrying it -- retrying would fail identically every time (the
    // cooldown won't have elapsed a few seconds later) and this job fires on
    // every returning Google-OAuth login within the cooldown window, not
    // just once.
    await expect(processor.process(makeJob())).resolves.toBeUndefined();
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('logs and rethrows a genuine (transient) failure so BullMQ retries it', async () => {
    aiService.getAiSuggestionSkills.mockRejectedValue(
      new Error('Provider unavailable'),
    );

    await expect(processor.process(makeJob())).rejects.toThrow(
      'Provider unavailable',
    );
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Provider unavailable'),
    );
  });

  it('resolves normally when generation succeeds', async () => {
    aiService.getAiSuggestionSkills.mockResolvedValue({
      data: ['TypeScript'],
      message: 'Skills successfully generated!',
    });

    await expect(processor.process(makeJob())).resolves.toBeUndefined();
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });
});
