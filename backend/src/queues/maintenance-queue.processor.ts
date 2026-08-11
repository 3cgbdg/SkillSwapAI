import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  JOB_AUTO_ACCEPT_FRIENDS,
  JOB_AUTO_ACCEPT_SESSIONS,
  QUEUE_MAINTENANCE,
} from './queue.constants';
import { AutoAcceptService } from 'src/tasks/auto-accept.service';

@Processor(QUEUE_MAINTENANCE)
export class MaintenanceQueueProcessor extends WorkerHost {
  constructor(private readonly autoAcceptService: AutoAcceptService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === JOB_AUTO_ACCEPT_FRIENDS) {
      await this.autoAcceptService.runAutoAcceptFriends();
      return;
    }
    if (job.name === JOB_AUTO_ACCEPT_SESSIONS) {
      await this.autoAcceptService.runAutoAcceptSessions();
    }
  }
}
