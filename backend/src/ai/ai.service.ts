import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { circuitBreaker, ConsecutiveBreaker, handleAll, wrap } from 'cockatiel';
import { ChatOpenAI } from '@langchain/openai';
import { IGeneratedActiveMatch } from './ai.interface';
import { PrismaService } from 'prisma/prisma.service';
import { ReturnDataType } from 'types/general';
import { User } from '../prisma/prisma-exports.js';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { AiUtils } from 'src/utils/ai.utils';
import { buildMatchGraph } from './graphs/match.graph';
import { buildSkillsGraph } from './graphs/skills.graph';

@Injectable()
export class AiService {
  private readonly aiPolicy = wrap(
    circuitBreaker(handleAll, {
      halfOpenAfter: 30_000,
      breaker: new ConsecutiveBreaker(5),
    }),
  );

  private readonly matchGraph: ReturnType<typeof buildMatchGraph>;
  private readonly skillsGraph: ReturnType<typeof buildSkillsGraph>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly requestGateway: RequestGateway,
  ) {
    const model = new ChatOpenAI({
      model: this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
      temperature: 0.7,
      timeout: 25_000,
      maxRetries: 2,
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });

    this.matchGraph = buildMatchGraph(model);
    this.skillsGraph = buildSkillsGraph(model);
  }

  async generateBodyForActiveMatch(
    myId: string,
    otherId: string,
  ): Promise<{ generatedData: IGeneratedActiveMatch; other: User } | null> {
    if (!myId || !otherId) {
      throw new BadRequestException('User IDs are required');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: [myId, otherId] } },
      include: { skillsToLearn: true, knownSkills: true },
    });

    if (users.length !== 2) {
      throw new BadRequestException('Two users must be found');
    }

    const u1 = users.find((u) => u.id === myId)!;
    const u2 = users.find((u) => u.id !== myId)!;

    const { result } = await this.aiPolicy.execute(() =>
      this.matchGraph.invoke({
        user1: AiUtils.formatUserForAi(u1),
        user2: AiUtils.formatUserForAi(u2),
      }),
    );

    return result ? { generatedData: result, other: u2 } : null;
  }

  async getAiSuggestionSkills(
    myId: string,
  ): Promise<ReturnDataType<string[]> | null> {
    if (!myId) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.findUnique({
      where: { id: myId },
      include: { skillsToLearn: true, knownSkills: true },
    });

    if (!user) throw new UnauthorizedException();

    const previousGenerationDate = user.lastSkillsGenerationDate;
    await this.claimRegenerationSlot(myId);

    try {
      const { result } = await this.aiPolicy.execute(() =>
        this.skillsGraph.invoke({
          skillsToLearn: user.skillsToLearn.map((s) => s.title),
          knownSkills: user.knownSkills.map((s) => s.title),
        }),
      );

      const readyAiArray = result?.skills ?? null;

      if (readyAiArray && readyAiArray.length > 0) {
        await this.saveAiSuggestions(myId, readyAiArray);
        void this.requestGateway.notifyAiSuggestions(myId, readyAiArray);
      }

      return readyAiArray
        ? { data: readyAiArray, message: 'Skills successfully generated!' }
        : null;
    } catch (error) {
      // The slot was already claimed below before the (slow) AI call, so a
      // genuine failure here shouldn't cost the user their regeneration
      // window -- give it back so they can retry immediately.
      await this.prisma.user
        .update({
          where: { id: myId },
          data: { lastSkillsGenerationDate: previousGenerationDate },
        })
        .catch(() => {});
      throw error;
    }
  }

  // Claims the 24h regeneration slot atomically, before the slow AI call
  // runs, instead of check-then-act on a value read earlier. Two concurrent
  // requests for the same user both racing this method will both re-evaluate
  // the WHERE clause against whatever's actually committed at UPDATE time --
  // Postgres serializes writes to the same row, so only the first can still
  // match once the second re-checks; that one gets count: 0 and is rejected.
  private async claimRegenerationSlot(userId: string): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const claim = await this.prisma.user.updateMany({
      where: {
        id: userId,
        OR: [
          { lastSkillsGenerationDate: null },
          { lastSkillsGenerationDate: { lt: cutoff } },
        ],
      },
      data: { lastSkillsGenerationDate: new Date() },
    });

    if (claim.count === 0) {
      throw new ForbiddenException('Wait 24 hours to regenerate skills.');
    }
  }

  private async saveAiSuggestions(userId: string, skills: string[]) {
    await this.prisma.skill.createMany({
      data: skills.map((title) => ({ title })),
      skipDuplicates: true,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiSuggestionSkills: skills,
        lastSkillsGenerationDate: new Date(),
      },
    });
  }
}
