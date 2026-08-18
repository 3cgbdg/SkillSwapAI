import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildIoredisOptions } from 'src/config/redis.config';
import { QUEUE_AI, QUEUE_MAINTENANCE } from './queue.constants';
import { AiQueueProcessor } from './ai-queue.processor';
import { MaintenanceQueueProcessor } from './maintenance-queue.processor';
import { QueueBootstrapService } from './queue-bootstrap.service';
import { PrismModule } from 'prisma/prisma.module';
import { AiModule } from 'src/ai/ai.module';
import { PlansModule } from 'src/plans/plans.module';
import { WebSocketsModule } from 'src/webSockets/webSockets.module';
import { AiJobsService } from './ai-jobs.service';
import { AutoAcceptService } from 'src/tasks/auto-accept.service';
import { ReviewPromptService } from 'src/tasks/review-prompt.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options = buildIoredisOptions(configService);
        return {
          connection: options ?? {
            host: '127.0.0.1',
            port: 6379,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: QUEUE_AI }, { name: QUEUE_MAINTENANCE }),
    PrismModule,
    AiModule,
    PlansModule,
    WebSocketsModule,
  ],
  providers: [
    AiQueueProcessor,
    MaintenanceQueueProcessor,
    QueueBootstrapService,
    AutoAcceptService,
    ReviewPromptService,
    AiJobsService,
  ],
  exports: [BullModule, AiJobsService],
})
export class QueuesModule {}
