import { Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { AiService } from 'src/ai/ai.service';
import { AiJobsService } from './ai-jobs.service';

describe('AiJobsService', () => {
  const queue = { add: jest.fn(), on: jest.fn() };
  const aiService = { getAiSuggestionSkills: jest.fn() };
  let service: AiJobsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    service = new AiJobsService(
      queue as unknown as Queue,
      aiService as unknown as AiService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses BullMQ when enqueueing succeeds', async () => {
    queue.add.mockResolvedValue({ id: 'job-1' });

    await service.enqueueSkillSuggestions('user-1');

    expect(queue.add).toHaveBeenCalled();
    expect(aiService.getAiSuggestionSkills).not.toHaveBeenCalled();
  });

  it('runs suggestions in-process when Redis rejects the queue operation', async () => {
    queue.add.mockRejectedValue(new Error('Redis quota exceeded'));
    aiService.getAiSuggestionSkills.mockResolvedValue({ data: ['TypeScript'] });

    await service.enqueueSkillSuggestions('user-1');

    expect(aiService.getAiSuggestionSkills).toHaveBeenCalledWith('user-1');
  });

  it('does not reject signup work when both queue and fallback fail', async () => {
    queue.add.mockRejectedValue(new Error('Redis quota exceeded'));
    aiService.getAiSuggestionSkills.mockRejectedValue(
      new Error('Provider unavailable'),
    );

    await expect(
      service.enqueueSkillSuggestions('user-1'),
    ).resolves.toBeUndefined();
  });
});
