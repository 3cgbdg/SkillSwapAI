import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  JOB_AUTO_ACCEPT_FRIENDS,
  JOB_AUTO_ACCEPT_SESSIONS,
  JOB_PROMPT_SESSION_REVIEWS,
  QUEUE_MAINTENANCE,
} from './queue.constants';
import { ErrorLogThrottle } from 'src/common/logging/error-log-throttle';

@Injectable()
export class QueueBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(QueueBootstrapService.name);
  private readonly errorLogThrottle = new ErrorLogThrottle();

  constructor(
    @InjectQueue(QUEUE_MAINTENANCE)
    private readonly maintenanceQueue: Queue,
  ) {
    // Queue extends EventEmitter and crashes the process on an unhandled
    // 'error' event (e.g. its Redis connection failing) unless something
    // listens for it.
    this.maintenanceQueue.on('error', (err) => {
      if (this.errorLogThrottle.shouldLog(err)) {
        this.logger.error(`Queue error: ${err.message}`);
      }
    });
  }

  async onModuleInit() {
    // Registering these jobs requires a working Redis connection. If Redis
    // is unavailable (or, as happened in production, its request quota is
    // exhausted), letting this reject would block Nest's bootstrap forever
    // since onModuleInit hooks are awaited before app.listen() — the whole
    // API would never come up just because a background maintenance queue
    // couldn't register. Log and continue instead.
    try {
      await this.maintenanceQueue.add(
        JOB_AUTO_ACCEPT_FRIENDS,
        {},
        {
          repeat: { every: 30_000 },
          jobId: JOB_AUTO_ACCEPT_FRIENDS,
          removeOnComplete: true,
          removeOnFail: 100,
        },
      );

      await this.maintenanceQueue.add(
        JOB_AUTO_ACCEPT_SESSIONS,
        {},
        {
          repeat: { every: 30_000 },
          jobId: JOB_AUTO_ACCEPT_SESSIONS,
          removeOnComplete: true,
          removeOnFail: 100,
        },
      );

      await this.maintenanceQueue.add(
        JOB_PROMPT_SESSION_REVIEWS,
        {},
        {
          // Coarser cadence than auto-accept: session-end granularity is
          // minutes, not seconds, so there's no urgency to catch it within 30s.
          repeat: { every: 60_000 },
          jobId: JOB_PROMPT_SESSION_REVIEWS,
          removeOnComplete: true,
          removeOnFail: 100,
        },
      );

      this.logger.log('Registered repeatable maintenance jobs');
    } catch (err) {
      this.logger.error(
        `Failed to register repeatable maintenance jobs, continuing without them: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
