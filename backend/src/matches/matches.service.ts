
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Match } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AiService } from 'src/ai/ai.service';
import { FriendChecker } from 'src/common/utils/FriendChecker';
import { FriendsService } from 'src/friends/friends.service';
import { PlansService } from 'src/plans/plans.service';

@Injectable()
export class MatchesService {
  constructor(private readonly plansService: PlansService, private readonly prisma: PrismaService, private readonly aiService: AiService, private readonly friendsService: FriendsService) { };
  async generateActiveMatch(myId: string, otherId: string): Promise<{ match: Match, message: string }> {
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
      throw new ForbiddenException('You have already created active match with this person');
    }
    const result = await this.aiService.generateBodyForActiveMatch(myId, otherId)
    if (!result?.generatedData)
      throw new InternalServerErrorException();
    const activeMatch = await this.prisma.match.create({
      data: {
        compatibility: result.generatedData.compatibility, aiExplanation: result.generatedData.aiExplanation, keyBenefits: result.generatedData.keyBenefits,
        other: { connect: { id: result.other.id } }, initiator: { connect: { id: myId } }
      },
      include: {
        other: {
          select: {
            name: true, skillsToLearn: { select: { title: true } },
            knownSkills: { select: { title: true } }
          }
        }
      }
    });
    if (!activeMatch)
      throw new InternalServerErrorException('Cannot createt active match');
    await this.plansService.createPlan(activeMatch.id, result.generatedData.modules);
    return { match: activeMatch, message: "Active match has been successfully generated" };
  }

  async getActiveMatches(myId: string): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: { OR: [{ initiatorId: myId }, { otherId: myId }] },
      include: {
        initiator: { select: { id: true, name: true, knownSkills: { select: { title: true } }, skillsToLearn: { select: { title: true } }, imageUrl: true } },
        other: { select: { id: true, name: true, knownSkills: { select: { title: true } }, skillsToLearn: { select: { title: true } }, imageUrl: true } }
      }
    });

    return matches.map(match => {
      const otherUser = match.initiator.id === myId ? match.other : match.initiator;
      const { initiator, ...newMatch } = match;
      return { ...newMatch, other: otherUser };
    });
  }


  async getAvailableMatches(myId: string) {
    const myUser = await this.prisma.user.findUnique({ where: { id: myId }, include: { skillsToLearn: true, knownSkills: true, friendOf: true, friends: true } });
    if (!myUser) throw new NotFoundException('User was not found');
    const skillsToLearnTitles = myUser.skillsToLearn.map(skill => skill.title);
    const knownSkillsTitles = myUser.knownSkills.map(skill => skill.title);
    const users = await this.prisma.user.findMany({ where: { knownSkills: { some: { title: { in: skillsToLearnTitles } } } }, include: { knownSkills: true, skillsToLearn: true } });
    const updatedUsers = users.filter(other => other.id != myId);
    // checker for being in friendship
    const checker = new FriendChecker(myUser);
    const sortedUsers = updatedUsers
      .map(user => {
        const knowsMySkills = user.knownSkills.some(skill =>
          skillsToLearnTitles.includes(skill.title)
        );
        const wantsMySkills = user.skillsToLearn.some(skill =>
          knownSkillsTitles.includes(skill.title)
        );
        const score = (knowsMySkills ? 1 : 0) + (wantsMySkills ? 1 : 0);
        const isFriend = checker.isFriend(user);
        return { score, otherId: user.id, isFriend, other: { name: user.name, imageUrl: user.imageUrl, skillsToLearn: user.skillsToLearn, knownSkills: user.knownSkills } };
      })
      .sort((a, b) => b.score - a.score);
    const usersForMatch = sortedUsers.slice(0, 9);
    return usersForMatch;
  }



}