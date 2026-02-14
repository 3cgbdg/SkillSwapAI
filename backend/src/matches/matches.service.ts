import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AiService } from 'src/ai/ai.service';
import { PlansService } from 'src/plans/plans.service';
import { ReturnDataType } from 'types/general';
import { IMatchResponse, IAvailableMatchItem } from 'types/matches';
import { IGeneratedActiveMatch } from 'src/ai/ai.interface';
import { MATCHES_CONSTANTS } from 'src/constants/matches';
import { MatchesUtils } from 'src/utils/matches.utils';

@Injectable()
export class MatchesService {
  constructor(
    private readonly plansService: PlansService,
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}
  async generateActiveMatch(
    myId: string,
    otherId: string,
  ): Promise<ReturnDataType<Plan>> {
    const exists = await this.doesMatchesExistsForUser(myId, otherId);

    if (exists) {
      throw new ForbiddenException(
        'You have already created active match with this person',
      );
    }
    const result = await this.aiService.generateBodyForActiveMatch(
      myId,
      otherId,
    );
    if (!result?.generatedData) throw new InternalServerErrorException();
    const activeMatchId = await this.createMatch(myId, otherId, result);
    const plan = await this.plansService.createPlan(
      activeMatchId,
      result.generatedData.modules,
    );
    return {
      data: plan,
      message: 'Active match has been successfully generated',
    };
  }

  async getActiveMatches(
    myId: string,
  ): Promise<ReturnDataType<IMatchResponse[]>> {
    const matches = await this.prisma.match.findMany({
      where: { OR: [{ initiatorId: myId }, { otherId: myId }] },
      include: {
        initiator: MatchesUtils.userSelect(),
        other: MatchesUtils.userSelect(),
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = matches.map((match) =>
      MatchesUtils.mapToMatchResponse(match, myId),
    );
    return { data };
  }

  async getAvailableMatches(
    myId: string,
  ): Promise<ReturnDataType<IAvailableMatchItem[]>> {
    const myUser = await this.prisma.user.findUnique({
      where: { id: myId },
      include: { skillsToLearn: true, knownSkills: true },
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
      include: {
        knownSkills: true,
        skillsToLearn: true,
        friendOf: { where: { OR: [{ user1Id: myId }, { user2Id: myId }] } },
        friends: { where: { OR: [{ user1Id: myId }, { user2Id: myId }] } },
      },
      take: MATCHES_CONSTANTS.DEFAULT_TAKE,
      orderBy: [
        { knownSkills: { _count: 'desc' } },
        { skillsToLearn: { _count: 'desc' } },
      ],
    });

    const data = users.map((u) => MatchesUtils.mapToAvailableMatch(u));
    return { data };
  }

  private async createMatch(
    myId: string,
    otherId: string,
    result: { generatedData: IGeneratedActiveMatch },
  ): Promise<string> {
    const activeMatch = await this.prisma.match.create({
      data: {
        compatibility: Math.round(Number(result.generatedData.compatibility)),
        aiExplanation: result.generatedData.aiExplanation,
        keyBenefits: result.generatedData.keyBenefits,
        other: { connect: { id: otherId } },
        initiator: { connect: { id: myId } },
      },
    });

    if (!activeMatch)
      throw new InternalServerErrorException('Cannot create active match');
    return activeMatch.id;
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
