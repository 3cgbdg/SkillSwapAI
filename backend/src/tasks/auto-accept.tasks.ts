import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';
import { OPTIMIZATION_CONSTANTS } from 'src/constants/optimization';
interface RequestWithUsers {
  id: string;
  fromId: string;
  toId: string;
  from: { name: string };
  to: { name: string };
}

@Injectable()
export class AutoAcceptTasks {
  private readonly logger = new Logger(AutoAcceptTasks.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleAutoAcceptFriends() {
    this.logger.debug('Running handleAutoAcceptFriends cron job');

    let lastId: string | null = null;
    let totalProcessed = 0;

    while (true) {
      const botRequests = await this.fetchPendingBotRequestsBatch(lastId);

      if (botRequests.length === 0) {
        break;
      }

      const processedCount = await this.processBotRequestsBatch(botRequests);
      totalProcessed += processedCount;

      lastId = botRequests[botRequests.length - 1].id;
    }

    if (totalProcessed > 0) {
      this.logger.log(
        `Successfully processed ${totalProcessed} bot friend requests`,
      );
    }
  }

  private async fetchPendingBotRequestsBatch(
    lastId: string | null,
  ): Promise<RequestWithUsers[]> {
    return (await this.prisma.request.findMany({
      where: {
        status: 'pending',
        type: 'FRIEND',
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

  private async processBotRequestsBatch(
    requests: RequestWithUsers[],
  ): Promise<number> {
    this.logger.log(`Processing batch of ${requests.length} friend requests`);

    const senderIds = requests.map((r) => r.fromId);
    const receiverIds = requests.map((r) => r.toId);

    // 1. Fetch all existing friendships for these pairs to avoid N+1 reads
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
        // 2. Prepare Create Friendship operation
        operations.push(
          this.prisma.friendship.create({
            data: {
              user1Id: request.fromId,
              user2Id: request.toId,
            },
          }),
        );
        this.logger.debug(
          `Queued friendship: ${request.from.name} and bot ${request.to.name}`,
        );
        // Add to set to avoid duplicates within the same batch
        friendshipSet.add(friendshipKey);
      }

      // 3. Prepare Delete Request operation
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
          `Transaction successful: processed ${processedInBatch} requests`,
        );
      } catch (error) {
        this.logger.error(`Batch transaction failed: ${String(error)}`);
        return 0;
      }
    }

    return processedInBatch;
  }
}
