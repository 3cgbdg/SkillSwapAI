import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'prisma/prisma.service';
import { ReturnDataType } from 'types/general';
import { IMatchResponse, IAvailableMatchItem } from 'types/matches';
import { MATCHES_CONSTANTS } from 'src/constants/matches';
import { MatchesUtils } from 'src/utils/matches.utils';
import { UserUtils } from 'src/utils/user.utils';
import { JOB_GENERATE_MATCH, QUEUE_AI } from 'src/queues/queue.constants';
import { CACHE_TTL_LIST_MS, CacheKeys } from 'src/utils/cache-keys';

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_AI) private readonly aiQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async enqueueActiveMatch(
    myId: string,
    otherId: string,
  ): Promise<{ jobId: string; message: string }> {
    const matchExists = await this.doesMatchesExistsForUser(myId, otherId);

    if (matchExists) {
      throw new ForbiddenException(
        'You have already created active match with this person',
      );
    }

    const jobId = randomUUID();
    const job = await this.aiQueue.add(
      JOB_GENERATE_MATCH,
      { myId, otherId, jobId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );

    return {
      jobId: String(job.id ?? jobId),
      message:
        'Match generation started. You will be notified when it is ready.',
    };
  }

  async getActiveMatches(
    myId: string,
  ): Promise<ReturnDataType<IMatchResponse[]>> {
    const cacheKey = CacheKeys.activeMatches(myId);
    const cached =
      await this.cacheManager.get<ReturnDataType<IMatchResponse[]>>(cacheKey);
    if (cached) return cached;

    const matches = await this.prisma.match.findMany({
      where: { OR: [{ initiatorId: myId }, { otherId: myId }] },
      include: {
        initiator: MatchesUtils.userSelect(),
        other: MatchesUtils.userSelect(),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const data = matches.map((match) => {
      const otherUser = UserUtils.getOtherUser(
        myId,
        match.initiator,
        match.other,
      );
      return {
        ...match,
        other: otherUser,
      };
    });
    const result = { data };
    await this.cacheManager.set(cacheKey, result, CACHE_TTL_LIST_MS);
    return result;
  }

  async getAvailableMatches(
    myId: string,
  ): Promise<ReturnDataType<IAvailableMatchItem[]>> {
    const cacheKey = CacheKeys.availableMatches(myId);
    const cached =
      await this.cacheManager.get<ReturnDataType<IAvailableMatchItem[]>>(
        cacheKey,
      );
    if (cached) return cached;

    const myUser = await this.prisma.user.findUnique({
      where: { id: myId },
      select: {
        skillsToLearn: { select: { title: true } },
        knownSkills: { select: { title: true } },
      },
    });

    if (!myUser) throw new NotFoundException('User was not found');

    const learnTitles = myUser.skillsToLearn.map((s) => s.title);
    const knowTitles = myUser.knownSkills.map((s) => s.title);

    const users = await this.prisma.user.findMany({
      where: MatchesUtils.buildAvailableMatchesFilter(
        myId,
        learnTitles,
        knowTitles,
      ),
      select: MatchesUtils.availableMatchesSelect(myId),
      take: MATCHES_CONSTANTS.DEFAULT_TAKE,
      orderBy: [
        { knownSkills: { _count: 'desc' } },
        { skillsToLearn: { _count: 'desc' } },
      ],
    });

    const data = users.map((u) => MatchesUtils.mapToAvailableMatch(u));
    const result = { data };
    await this.cacheManager.set(cacheKey, result, CACHE_TTL_LIST_MS);
    return result;
  }

  private async doesMatchesExistsForUser(
    myId: string,
    otherId: string,
  ): Promise<boolean> {
    const count = await this.prisma.match.count({
      where: MatchesUtils.getMatchFilter(myId, otherId),
    });
    return count > 0;
  }
}
