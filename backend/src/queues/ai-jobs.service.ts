import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_AI_SKILL_SUGGESTIONS, QUEUE_AI } from './queue.constants';

@Injectable()
export class AiJobsService {
  private readonly logger = new Logger(AiJobsService.name);

  constructor(@InjectQueue(QUEUE_AI) private readonly aiQueue: Queue) {
    // Queue extends EventEmitter and crashes the process on an unhandled
    // 'error' event (e.g. its Redis connection failing) unless something
    // listens for it.
    this.aiQueue.on('error', (err) =>
      this.logger.error(`Queue error: ${err.message}`),
    );
  }

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
