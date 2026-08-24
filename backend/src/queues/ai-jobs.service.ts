import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_AI_SKILL_SUGGESTIONS, QUEUE_AI } from './queue.constants';
import { ErrorLogThrottle } from 'src/common/logging/error-log-throttle';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class AiJobsService {
  private readonly logger = new Logger(AiJobsService.name);
  private readonly errorLogThrottle = new ErrorLogThrottle();

  constructor(
    @InjectQueue(QUEUE_AI) private readonly aiQueue: Queue,
    private readonly aiService: AiService,
  ) {
    // Queue extends EventEmitter and crashes the process on an unhandled
    // 'error' event (e.g. its Redis connection failing) unless something
    // listens for it.
    this.aiQueue.on('error', (err) => {
      if (this.errorLogThrottle.shouldLog(err)) {
        this.logger.error(`Queue error: ${err.message}`);
      }
    });
  }

  async enqueueSkillSuggestions(userId: string): Promise<void> {
    try {
      await this.aiQueue.add(
        JOB_AI_SKILL_SUGGESTIONS,
        { userId },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
        },
      );
    } catch (error) {
      if (this.errorLogThrottle.shouldLog(error)) {
        this.logger.error(
          `Failed to enqueue skill suggestions; running the job in-process: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      try {
        await this.aiService.getAiSuggestionSkills(userId);
      } catch (fallbackError) {
        if (this.errorLogThrottle.shouldLog(fallbackError)) {
          this.logger.error(
            `In-process skill suggestions failed: ${
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError)
            }`,
          );
        }
      }
    }
  }
}
