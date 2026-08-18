import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  JOB_AUTO_ACCEPT_FRIENDS,
  JOB_AUTO_ACCEPT_SESSIONS,
  JOB_PROMPT_SESSION_REVIEWS,
  QUEUE_MAINTENANCE,
} from './queue.constants';
import { AutoAcceptService } from 'src/tasks/auto-accept.service';
import { ReviewPromptService } from 'src/tasks/review-prompt.service';

@Processor(QUEUE_MAINTENANCE)
export class MaintenanceQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MaintenanceQueueProcessor.name);

  constructor(
    private readonly autoAcceptService: AutoAcceptService,
    private readonly reviewPromptService: ReviewPromptService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === JOB_AUTO_ACCEPT_FRIENDS) {
      await this.autoAcceptService.runAutoAcceptFriends();
      return;
    }
    if (job.name === JOB_AUTO_ACCEPT_SESSIONS) {
      await this.autoAcceptService.runAutoAcceptSessions();
      return;
    }
    if (job.name === JOB_PROMPT_SESSION_REVIEWS) {
      await this.reviewPromptService.runPromptSessionReviews();
    }
  }

  // The underlying BullMQ Worker extends EventEmitter and crashes the
  // process on an unhandled 'error' event (e.g. its Redis connection
  // failing) unless something listens for it.
  @OnWorkerEvent('error')
  onError(err: Error) {
    this.logger.error(`Worker error: ${err.message}`);
  }
}
