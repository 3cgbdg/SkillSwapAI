import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleStatus } from '@prisma/client';
import { link } from 'fs';
import { PrismaService } from 'prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface IAiReportAnalyzedMatch {
  compatibility: number,
  aiExplanation: string,
  id?: string,
  keyBenefits: string[],
}

interface IAiReportGeneratedPlan {
  modules:{
    title:string,
    status:ModuleStatus,
    objectives:string[],
    activities:string[],
    timeline:number,
    resources:{
      title:string,
      description?:string,
      link:string
    }[]
  }[]
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
      let readyAiArray: IAiReportAnalyzedMatch[] | null = null;
      if (typeof rawAiArray == 'string') {
        const str = rawAiArray.match(/```json\s([\s\S]+?)```/)
        readyAiArray = str ? JSON.parse(str[1]) : JSON.parse(rawAiArray);
      } else {
        readyAiArray = rawAiArray;
      }
      if (readyAiArray) {
        let matches: IMatchResponse[] = [];

        for (let item of readyAiArray) {
          const match = await this.prisma.match.create({ data: { compatibility: item.compatibility, aiExplanation: item.aiExplanation, keyBenefits: item.keyBenefits, other: { connect: { id: item.id } }, initiator: { connect: { id: myId } } }, include: { other: { select: { name: true, skillsToLearn: { select: { title: true } }, knownSkills: { select: { title: true } } } } } });
          matches.push(match);
        }
        return matches;
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
    const matches = await this.prisma.match.findMany({
      where: { initiatorId: myId }
      , include: { other: { select: { name: true, skillsToLearn: { select: { title: true } }, knownSkills: { select: { title: true } } } } }
    });
    return matches;
  }


  async createPlan(myId: string) {
    const match = await this.prisma.match.findFirst({
      where: { initiatorId: myId }
      , include: { other: { select: { knownSkills: true, skillsToLearn: true, name: true, id: true } }, initiator: { select: { knownSkills: true, skillsToLearn: true, name: true, id: true } } }
    });
    if (!match) throw new NotFoundException('Match was not found!');
    const initiator = { ...match.initiator, skillsToLearn: match.initiator.skillsToLearn.map(item => item.title), knownSkills: match.initiator.knownSkills.map(item => item.title) }
    const other = { ...match.other, skillsToLearn: match.other.skillsToLearn.map(item => item.title), knownSkills: match.other.knownSkills.map(item => item.title) }
    const fastApiResponse = await firstValueFrom(
      this.httpService.post(`${this.configService.get<string>('FASTAPI_URL')}/plan`, { users: [initiator, other], compatibility: match.compatibility },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        })
    );
    const rawAiObject = fastApiResponse.data.AIReport;
    let readyAiObject: IAiReportGeneratedPlan | null = null;
    if (typeof rawAiObject == 'string') {
      const str = rawAiObject.match(/```json\s([\s\S]+?)```/)
      readyAiObject = str ? JSON.parse(str[1]) : JSON.parse(rawAiObject);
    } else {
      readyAiObject = rawAiObject;
    }
    if (readyAiObject) {
    console.log(readyAiObject)
   const plan = await this.prisma.plan.create({
    data: {
      modules: {
        create: readyAiObject.modules.map(module => ({
          title: module.title,
          status: module.status,
          objectives: module.objectives,
          activities: module.activities,
          timeline: module.timeline,
          resources: {
            create: module.resources.map(res => ({
              title: res.title,
              description: res.description,
              link:res.link
            }))
          }
        }))
      }
    },
    include: {
      modules: {
        include: {
          resources: true
        }
      }
    }
  });

  console.log(plan)
    } else {
      throw new InternalServerErrorException();
    }
   
  }

}
