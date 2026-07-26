import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  JOB_AUTO_ACCEPT_FRIENDS,
  JOB_AUTO_ACCEPT_SESSIONS,
  QUEUE_MAINTENANCE,
} from './queue.constants';

@Injectable()
export class QueueBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(QueueBootstrapService.name);

  constructor(
    @InjectQueue(QUEUE_MAINTENANCE)
    private readonly maintenanceQueue: Queue,
  ) {}

  async onModuleInit() {
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

    this.logger.log('Registered repeatable maintenance jobs');
  }
}
