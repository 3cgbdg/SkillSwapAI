import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Job } from 'bullmq';
import { AiService } from 'src/ai/ai.service';
import { PlansService } from 'src/plans/plans.service';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { MatchesUtils } from 'src/utils/matches.utils';
import { UserUtils } from 'src/utils/user.utils';
import { CacheKeys } from 'src/utils/cache-keys';
import {
  GenerateMatchJobPayload,
  JOB_GENERATE_MATCH,
  JOB_AI_SKILL_SUGGESTIONS,
  QUEUE_AI,
  AiSkillSuggestionsJobPayload,
} from './queue.constants';

@Processor(QUEUE_AI)
export class AiQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(AiQueueProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly plansService: PlansService,
    private readonly prisma: PrismaService,
    private readonly requestGateway: RequestGateway,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();
  }

  async process(
    job: Job<GenerateMatchJobPayload | AiSkillSuggestionsJobPayload>,
  ): Promise<void> {
    if (job.name === JOB_GENERATE_MATCH) {
      await this.processGenerateMatch(job as Job<GenerateMatchJobPayload>);
      return;
    }
    if (job.name === JOB_AI_SKILL_SUGGESTIONS) {
      await this.processSkillSuggestions(
        job as Job<AiSkillSuggestionsJobPayload>,
      );
    }
  }

  private async processGenerateMatch(job: Job<GenerateMatchJobPayload>) {
    const { myId, otherId } = job.data;

    try {
      const result = await this.aiService.generateBodyForActiveMatch(
        myId,
        otherId,
      );
      if (!result?.generatedData) {
        throw new Error('AI returned empty match data');
      }

      const matchId = await this.prisma.$transaction(async (tx) => {
        const match = await tx.match.create({
          data: {
            compatibility: Math.round(
              Number(result.generatedData.compatibility),
            ),
            aiExplanation: result.generatedData.aiExplanation,
            keyBenefits: result.generatedData.keyBenefits,
            other: { connect: { id: otherId } },
            initiator: { connect: { id: myId } },
          },
        });

        await this.plansService.createPlanInTransaction(
          tx,
          match.id,
          result.generatedData.modules,
        );

        return match.id;
      });

      await Promise.all([
        this.cacheManager.del(CacheKeys.availableMatches(myId)),
        this.cacheManager.del(CacheKeys.availableMatches(otherId)),
        this.cacheManager.del(CacheKeys.activeMatches(myId)),
        this.cacheManager.del(CacheKeys.activeMatches(otherId)),
      ]);

      const matchDb = await this.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          initiator: MatchesUtils.userSelect(),
          other: MatchesUtils.userSelect(),
        },
      });

      if (!matchDb) {
        throw new Error('Match not found after creation');
      }

      const mappedMatch = {
        ...matchDb,
        other: UserUtils.getOtherUser(myId, matchDb.initiator, matchDb.other),
      };

      await this.requestGateway.notifyMatchReady(myId, {
        match: mappedMatch,
        message: 'Active match has been successfully generated',
      });
    } catch (error) {
      this.logger.error(
        `Match generation failed for job ${job.id}: ${String(error)}`,
      );
      await this.requestGateway.notifyMatchFailed(myId, {
        otherId,
        message:
          error instanceof Error ? error.message : 'Match generation failed',
      });
      throw error;
    }
  }

  private async processSkillSuggestions(
    job: Job<AiSkillSuggestionsJobPayload>,
  ) {
    await this.aiService.getAiSuggestionSkills(job.data.userId);
  }

  // The underlying BullMQ Worker extends EventEmitter and crashes the
  // process on an unhandled 'error' event (e.g. its Redis connection
  // failing) unless something listens for it.
  @OnWorkerEvent('error')
  onError(err: Error) {
    this.logger.error(`Worker error: ${err.message}`);
  }
}
