import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Match } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AiService } from 'src/ai/ai.service';
import { FriendsService } from 'src/friends/friends.service';
import { PlansService } from 'src/plans/plans.service';
import { ReturnDataType } from 'types/general';
import { IMatchResponse } from 'types/matches';

@Injectable()
export class MatchesService {
  constructor(
    private readonly plansService: PlansService,
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly friendsService: FriendsService,
  ) { }
  async generateActiveMatch(
    myId: string,
    otherId: string,
  ): Promise<ReturnDataType<Match>> {
    const existedMatchesForThisUsers = await this.prisma.match.findMany({
      where: {
        OR: [
          {
            AND: [{ initiatorId: myId }, { otherId: otherId }],
          },
          {
            AND: [{ initiatorId: otherId }, { otherId: myId }],
          },
        ],
      },
    });
    if (existedMatchesForThisUsers.length > 0) {
      throw new ForbiddenException(
        'You have already created active match with this person',
      );
    }
    const result = await this.aiService.generateBodyForActiveMatch(
      myId,
      otherId,
    );
    if (!result?.generatedData) throw new InternalServerErrorException();
    const activeMatch = await this.prisma.match.create({
      data: {
        compatibility: Math.round(Number(result.generatedData.compatibility)),
        aiExplanation: result.generatedData.aiExplanation,
        keyBenefits: result.generatedData.keyBenefits,
        other: { connect: { id: result.other.id } },
        initiator: { connect: { id: myId } },
      },
      include: {
        other: {
          select: {
            name: true,
            skillsToLearn: { select: { title: true } },
            knownSkills: { select: { title: true } },
          },
        },
      },
    });
    if (!activeMatch)
      throw new InternalServerErrorException('Cannot createt active match');
    await this.plansService.createPlan(
      activeMatch.id,
      result.generatedData.modules,
    );
    const data = activeMatch;
    return {
      data,
      message: 'Active match has been successfully generated',
    };
  }

  async getActiveMatches(
    myId: string,
  ): Promise<ReturnDataType<IMatchResponse[]>> {
    const matches = await this.prisma.match.findMany({
      where: { OR: [{ initiatorId: myId }, { otherId: myId }] },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            knownSkills: { select: { title: true } },
            skillsToLearn: { select: { title: true } },
            imageUrl: true,
          },
        },
        other: {
          select: {
            id: true,
            name: true,
            knownSkills: { select: { title: true } },
            skillsToLearn: { select: { title: true } },
            imageUrl: true,
          },
        },
      },
    });
    const data = matches.map((match) => {
      const otherUser =
        match.initiator.id === myId ? match.other : match.initiator;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initiator, ...newMatch } = match;
      return { ...newMatch, other: otherUser };
    });
    return { data };
  }

  async getAvailableMatches(myId: string): Promise<ReturnDataType<any>> {
    const myUser = await this.prisma.user.findUnique({
      where: { id: myId },
      include: {
        skillsToLearn: true,
        knownSkills: true,
      },
    });
    if (!myUser) throw new NotFoundException('User was not found');
    const skillsToLearnTitles = myUser.skillsToLearn.map(
      (skill) => skill.title,
    );
    const myKnownSkillsTitles = myUser.knownSkills.map(
      (skill) => skill.title,
    );

    console.log('DEBUG: myId', myId);
    console.log('DEBUG: skillsToLearnTitles', skillsToLearnTitles);
    console.log('DEBUG: myKnownSkillsTitles', myKnownSkillsTitles);
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                OR: [
                  {
                    knownSkills: { some: { title: { in: skillsToLearnTitles } } },
                  },
                  {
                    skillsToLearn: {
                      some: { title: { in: myKnownSkillsTitles } },
                    },
                  },
                ],
              },
              { friendOf: { some: { user1Id: myId } } },
              { friendOf: { some: { user2Id: myId } } },
              { friends: { some: { user1Id: myId } } },
              { friends: { some: { user2Id: myId } } },
            ],
          },
        ],
        NOT: [
          { id: myId },
          { matchesInitiated: { some: { otherId: myId } } },
          { matchesReceived: { some: { initiatorId: myId } } },
        ],
      },
      include: {
        knownSkills: true,
        skillsToLearn: true,
        friendOf: {
          where: {
            OR: [{ user1Id: myId }, { user2Id: myId }],
          },
        },
        friends: {
          where: {
            OR: [{ user1Id: myId }, { user2Id: myId }],
          },
        },
      },
      take: 20,
      orderBy: [
        { knownSkills: { _count: 'desc' } },
        { skillsToLearn: { _count: 'desc' } },
      ],
    });
    console.log('DEBUG: Users found for available matches:', users.length);
    console.log('DEBUG: Users:', JSON.stringify(users, null, 2));
    const data = users.map((user) => {
      return {
        isFriend: user.friendOf.length > 0 || user.friends.length > 0,
        other: {
          name: user.name,
          id: user.id,
          imageUrl: user.imageUrl,
          skillsToLearn: user.skillsToLearn,
          knownSkills: user.knownSkills,
        },
      };
    });
    return { data };
  }
}
