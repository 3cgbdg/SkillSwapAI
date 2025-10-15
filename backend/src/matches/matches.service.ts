import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface IAiReportItem {
  compatibility: number,
  aiExplanation: string,
  id?: string,
}

export interface IMatchResponse {
  compatibility: number,
  aiExplanation: string,
  id: string,
  initiatorId: string,
  otherId: string,
  other: {
    knownSkills: {
      title: string
    }[],

    skillsToLearn: {
      title: string
    }[],
  }
}
@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService, private readonly httpService: HttpService) { };
  async create(myId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: myId }, include: { skillsToLearn: true, knownSkills: true } });
    if (!user) throw new NotFoundException('User was not found!');
    const skillsToLearnTitles = user.skillsToLearn.map(skill => skill.title);
    const knownSkillsTitles = user.knownSkills.map(skill => skill.title);
    const users = await this.prisma.user.findMany({ where: { knownSkills: { some: { title: { in: skillsToLearnTitles } } } }, include: { knownSkills: true, skillsToLearn: true } });

    const sortedUsers = users
      .map(user => {
        const knowsMySkills = user.knownSkills.some(skill =>
          skillsToLearnTitles.includes(skill.title)
        );
        const wantsMySkills = user.skillsToLearn.some(skill =>
          knownSkillsTitles.includes(skill.title)
        );
        const score = (knowsMySkills ? 1 : 0) + (wantsMySkills ? 1 : 0);
        return { ...user, skillsToLearn: user.skillsToLearn.map(skill => skill.title), knownSkills: user.knownSkills.map(skill => skill.title), score };
      })
      .sort((a, b) => b.score - a.score);
    const usersForMatch = sortedUsers.slice(0, 9);
    console.log(usersForMatch)
    try {
      const fastApiResponse = await firstValueFrom(
        this.httpService.post(`${this.configService.get<string>('FASTAPI_URL')}/analyze/${myId}`,
          { usersForMatch: usersForMatch, thisUser: { ...user, knownSkills: knownSkillsTitles, skillsToLearn: skillsToLearnTitles } },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          })
      );
      const rawAiArray = fastApiResponse?.data?.AIReport;
      let readyAiArray: IAiReportItem[] | null = null;
      if (typeof rawAiArray == 'string') {
        const str = rawAiArray.match(/```json\s([\s\S]+?)```/)
        readyAiArray = str ? JSON.parse(str[1]) : JSON.parse(rawAiArray);
      } else {
        readyAiArray = rawAiArray;
      }
      if (readyAiArray) {
        let matches: IMatchResponse[] = [];

        for (let item of readyAiArray) {
          const match = await this.prisma.match.create({ data: { compatibility: item.compatibility, aiExplanation: item.aiExplanation, other: { connect: { id: item.id } }, initiator: { connect: { id: myId } } }, include: { other: { select: { name: true, skillsToLearn: { select: { title: true } }, knownSkills: { select: { title: true } } } } } });
          matches.push(match);
        }
        console.log(readyAiArray, matches)
        return  matches;
      } else {
        throw new InternalServerErrorException();
      }
    } catch (error) {
      throw new HttpException(
        error?.response?.data || 'AI service error',
        error?.status || 500
      )
    }

  }

  async getMatches(myId: string) {
    const matches = await this.prisma.match.findMany({ where: { initiatorId: myId }
    , include: { other: { select: { name: true, skillsToLearn: { select: { title: true } }, knownSkills: { select: { title: true } } } } }});
    return  matches;
  }

}
