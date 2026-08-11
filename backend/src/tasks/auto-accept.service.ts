import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OPTIMIZATION_CONSTANTS } from 'src/constants/optimization';
import type { RequestType } from 'types/requests';
import {
  CRON_LOCK_AUTO_ACCEPT_FRIENDS,
  CRON_LOCK_AUTO_ACCEPT_SESSIONS,
  releaseAdvisoryLock,
  tryAcquireAdvisoryLock,
} from 'src/tasks/advisory-lock.util';

interface RequestWithUsers {
  id: string;
  fromId: string;
  toId: string;
  sessionId: string | null;
  type: string;
  from: { name: string };
  to: { name: string };
}

@Injectable()
export class AutoAcceptService {
  private readonly logger = new Logger(AutoAcceptService.name);

  constructor(private readonly prisma: PrismaService) {}

  async runAutoAcceptFriends(): Promise<void> {
    const acquired = await tryAcquireAdvisoryLock(
      this.prisma,
      CRON_LOCK_AUTO_ACCEPT_FRIENDS,
    );
    if (!acquired) {
      return;
    }

    try {
      await this.processFriends();
    } finally {
      await releaseAdvisoryLock(this.prisma, CRON_LOCK_AUTO_ACCEPT_FRIENDS);
    }
  }

  async runAutoAcceptSessions(): Promise<void> {
    const acquired = await tryAcquireAdvisoryLock(
      this.prisma,
      CRON_LOCK_AUTO_ACCEPT_SESSIONS,
    );
    if (!acquired) {
      return;
    }

    try {
      await this.processSessions();
    } finally {
      await releaseAdvisoryLock(this.prisma, CRON_LOCK_AUTO_ACCEPT_SESSIONS);
    }
  }

  private async processFriends() {
    this.logger.debug('Running auto-accept friends job');

    let lastId: string | null = null;
    let totalProcessed = 0;

    while (true) {
      const botRequests = await this.fetchPendingBotRequestsBatch(
        lastId,
        'FRIEND',
      );

      if (botRequests.length === 0) {
        break;
      }

      const processedCount =
        await this.processBotFriendRequestsBatch(botRequests);
      totalProcessed += processedCount;

      lastId = botRequests[botRequests.length - 1].id;
    }

    if (totalProcessed > 0) {
      this.logger.log(
        `Successfully processed ${totalProcessed} bot friend requests`,
      );
    }
  }

  private async processSessions() {
    this.logger.debug('Running auto-accept sessions job');

    let lastId: string | null = null;
    let totalProcessed = 0;

    while (true) {
      const botRequests = await this.fetchPendingBotRequestsBatch(
        lastId,
        'SESSIONCREATED',
      );

      if (botRequests.length === 0) {
        break;
      }

      const processedCount =
        await this.processBotSessionRequestsBatch(botRequests);
      totalProcessed += processedCount;

      lastId = botRequests[botRequests.length - 1].id;
    }

    if (totalProcessed > 0) {
      this.logger.log(
        `Successfully processed ${totalProcessed} bot session requests`,
      );
    }
  }

  private async fetchPendingBotRequestsBatch(
    lastId: string | null,
    type: RequestType,
  ): Promise<RequestWithUsers[]> {
    return (await this.prisma.request.findMany({
      where: {
        status: 'pending',
        type,
        to: {
          isBot: true,
        },
        id: lastId ? { gt: lastId } : undefined,
      },
      include: {
        to: true,
        from: true,
      },
      take: OPTIMIZATION_CONSTANTS.AUTO_ACCEPT_BATCH_SIZE,
      orderBy: { id: 'asc' },
    })) as unknown as RequestWithUsers[];
  }

  private async processBotFriendRequestsBatch(
    requests: RequestWithUsers[],
  ): Promise<number> {
    this.logger.log(`Processing batch of ${requests.length} friend requests`);

    const senderIds = requests.map((r) => r.fromId);
    const receiverIds = requests.map((r) => r.toId);

    const existingFriendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: { in: senderIds }, user2Id: { in: receiverIds } },
          { user1Id: { in: receiverIds }, user2Id: { in: senderIds } },
        ],
      },
    });

    const friendshipSet = new Set(
      existingFriendships.map((f) => [f.user1Id, f.user2Id].sort().join('-')),
    );

    let processedInBatch = 0;
    const operations: any[] = [];

    for (const request of requests) {
      const friendshipKey = [request.fromId, request.toId].sort().join('-');
      const isAlreadyFriend = friendshipSet.has(friendshipKey);

      if (!isAlreadyFriend) {
        operations.push(
          this.prisma.friendship.create({
            data: {
              user1Id: request.fromId,
              user2Id: request.toId,
            },
          }),
        );
        friendshipSet.add(friendshipKey);
      }

      operations.push(
        this.prisma.request.delete({
          where: { id: request.id },
        }),
      );
      processedInBatch++;
    }

    if (operations.length > 0) {
      try {
        await this.prisma.$transaction(operations);
      } catch (error) {
        this.logger.error(`Friend batch transaction failed: ${String(error)}`);
        return 0;
      }
    }

    return processedInBatch;
  }

  private async processBotSessionRequestsBatch(
    requests: RequestWithUsers[],
  ): Promise<number> {
    this.logger.log(`Processing batch of ${requests.length} session requests`);

    let processedInBatch = 0;
    const operations: any[] = [];

    for (const request of requests) {
      if (request.sessionId) {
        operations.push(
          this.prisma.session.update({
            where: { id: request.sessionId },
            data: { status: 'AGREED' },
          }),
        );

        operations.push(
          this.prisma.request.create({
            data: {
              fromId: request.toId,
              toId: request.fromId,
              sessionId: request.sessionId,
              type: 'SESSIONACCEPTED',
            },
          }),
        );
      }

      operations.push(
        this.prisma.request.delete({
          where: { id: request.id },
        }),
      );
      processedInBatch++;
    }

    if (operations.length > 0) {
      try {
        await this.prisma.$transaction(operations);
      } catch (error) {
        this.logger.error(`Session batch transaction failed: ${String(error)}`);
        return 0;
      }
    }

    return processedInBatch;
  }
}
