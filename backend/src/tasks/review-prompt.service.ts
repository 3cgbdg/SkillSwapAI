import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { OPTIMIZATION_CONSTANTS } from 'src/constants/optimization';
import {
  CRON_LOCK_PROMPT_SESSION_REVIEWS,
  releaseAdvisoryLock,
  tryAcquireAdvisoryLock,
} from 'src/tasks/advisory-lock.util';

interface EndedSessionBatchItem {
  id: string;
  title: string;
  users: { id: string }[];
}

@Injectable()
export class ReviewPromptService {
  private readonly logger = new Logger(ReviewPromptService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly requestGateway: RequestGateway,
  ) {}

  async runPromptSessionReviews(): Promise<void> {
    const acquired = await tryAcquireAdvisoryLock(
      this.prisma,
      CRON_LOCK_PROMPT_SESSION_REVIEWS,
    );
    if (!acquired) {
      return;
    }

    try {
      await this.sweepEndedSessions();
    } finally {
      await releaseAdvisoryLock(this.prisma, CRON_LOCK_PROMPT_SESSION_REVIEWS);
    }
  }

  private async sweepEndedSessions() {
    this.logger.debug('Running session review-prompt sweep');

    let lastId: string | null = null;
    let totalProcessed = 0;

    while (true) {
      const batch = await this.fetchEndedUnpromptedBatch(lastId);
      if (batch.length === 0) {
        break;
      }

      for (const session of batch) {
        for (const user of session.users) {
          await this.requestGateway.notifyReviewPrompt(user.id, {
            sessionId: session.id,
            sessionTitle: session.title,
          });
        }
      }

      await this.prisma.session.updateMany({
        where: { id: { in: batch.map((s) => s.id) } },
        data: { reviewPromptedAt: new Date() },
      });

      totalProcessed += batch.length;
      lastId = batch[batch.length - 1].id;
    }

    if (totalProcessed > 0) {
      this.logger.log(`Prompted reviews for ${totalProcessed} ended sessions`);
    }
  }

  private async fetchEndedUnpromptedBatch(
    lastId: string | null,
  ): Promise<EndedSessionBatchItem[]> {
    return this.prisma.session.findMany({
      where: {
        status: 'AGREED',
        endsAt: { lt: new Date() },
        reviewPromptedAt: null,
        id: lastId ? { gt: lastId } : undefined,
      },
      select: {
        id: true,
        title: true,
        users: { select: { id: true } },
      },
      take: OPTIMIZATION_CONSTANTS.AUTO_ACCEPT_BATCH_SIZE,
      orderBy: { id: 'asc' },
    });
  }
}
