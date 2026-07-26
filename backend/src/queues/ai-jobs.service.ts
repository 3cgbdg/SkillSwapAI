import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_AI_SKILL_SUGGESTIONS, QUEUE_AI } from './queue.constants';

@Injectable()
export class AiJobsService {
  constructor(@InjectQueue(QUEUE_AI) private readonly aiQueue: Queue) {}

  enqueueSkillSuggestions(userId: string): void {
    void this.aiQueue
      .add(
        JOB_AI_SKILL_SUGGESTIONS,
        { userId },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
        },
      )
      .catch(() => {});
  }
}
