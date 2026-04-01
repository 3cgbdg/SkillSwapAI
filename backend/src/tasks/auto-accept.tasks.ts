import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';
import { OPTIMIZATION_CONSTANTS } from 'src/constants/optimization';

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
export class AutoAcceptTasks {
  private readonly logger = new Logger(AutoAcceptTasks.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Auto-accept friend requests sent TO bot users.
   * Runs every 30 seconds.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleAutoAcceptFriends() {
    this.logger.debug('Running handleAutoAcceptFriends cron job');

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

  /**
   * Auto-accept session requests sent TO bot users.
   * Runs every 30 seconds, offset by 15s from friend requests.
   */
  @Cron('15,45 * * * * *')
  async handleAutoAcceptSessions() {
    this.logger.debug('Running handleAutoAcceptSessions cron job');

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

  // ─── Shared Fetch ────────────────────────────────────────────

  private async fetchPendingBotRequestsBatch(
    lastId: string | null,
    type: string,
  ): Promise<RequestWithUsers[]> {
    return (await this.prisma.request.findMany({
      where: {
        status: 'pending',
        type: type as any,
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

  // ─── Friend Request Processing ───────────────────────────────

  private async processBotFriendRequestsBatch(
    requests: RequestWithUsers[],
  ): Promise<number> {
    this.logger.log(
      `Processing batch of ${requests.length} friend requests`,
    );

    const senderIds = requests.map((r) => r.fromId);
    const receiverIds = requests.map((r) => r.toId);

    // Fetch all existing friendships to avoid N+1 reads
    const existingFriendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: { in: senderIds }, user2Id: { in: receiverIds } },
          { user1Id: { in: receiverIds }, user2Id: { in: senderIds } },
        ],
      },
    });

    const friendshipSet = new Set(
      existingFriendships.map((f) =>
        [f.user1Id, f.user2Id].sort().join('-'),
      ),
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
        this.logger.debug(
          `Queued friendship: ${request.from.name} ↔ bot ${request.to.name}`,
        );
        friendshipSet.add(friendshipKey);
      }

      // Delete the friend request
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
        this.logger.log(
          `Transaction successful: processed ${processedInBatch} friend requests`,
        );
      } catch (error) {
        this.logger.error(`Friend batch transaction failed: ${String(error)}`);
        return 0;
      }
    }

    return processedInBatch;
  }

  // ─── Session Request Processing ──────────────────────────────

  private async processBotSessionRequestsBatch(
    requests: RequestWithUsers[],
  ): Promise<number> {
    this.logger.log(
      `Processing batch of ${requests.length} session requests`,
    );

    let processedInBatch = 0;
    const operations: any[] = [];

    for (const request of requests) {
      if (request.sessionId) {
        // Mark the session as AGREED
        operations.push(
          this.prisma.session.update({
            where: { id: request.sessionId },
            data: { status: 'AGREED' },
          }),
        );

        // Create an ACCEPTED notification back to the sender
        operations.push(
          this.prisma.request.create({
            data: {
              fromId: request.toId, // bot is responding
              toId: request.fromId, // back to the original sender
              sessionId: request.sessionId,
              type: 'SESSIONACCEPTED',
            },
          }),
        );

        this.logger.debug(
          `Bot ${request.to.name} accepted session from ${request.from.name}`,
        );
      }

      // Delete the original SESSIONCREATED request
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
        this.logger.log(
          `Transaction successful: processed ${processedInBatch} session requests`,
        );
      } catch (error) {
        this.logger.error(
          `Session batch transaction failed: ${String(error)}`,
        );
        return 0;
      }
    }

    return processedInBatch;
  }
}
