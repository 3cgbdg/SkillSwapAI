import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { set } from 'react-hook-form';
import { firstValueFrom } from 'rxjs';
import { IAiReportGeneratedPlan } from 'types/types';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService, private readonly httpService: HttpService) { };
  async getPlan(matchId) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId }, include: { plan: { include: { modules: { include: { resources: true } } } } }
    });
    if (!match) {
      throw new NotFoundException('Match was not found!');
    }
    console.log(match.plan, 'getting plan ');

    return match.plan;
  }


  async createPlan(myId: string) {
    const match = await this.prisma.match.findFirst({
      where: { initiatorId: myId }
      , include: { other: { select: { knownSkills: true, skillsToLearn: true, name: true, id: true } }, plan: { select: { id: true } }, initiator: { select: { knownSkills: true, skillsToLearn: true, name: true, id: true } } }
    });
    if (!match) throw new NotFoundException('Match was - not found!');
    if (match.plan && match.plan.id) throw new ForbiddenException('Plan has been already created!');
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
          match: { connect: { id: match.id } },
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
                  link: res.link
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
      return plan;
    } else {
      throw new InternalServerErrorException();
    }

  }

  async updateStatusToCompeted(planId, moduleId) {
    const yourPlan = await this.prisma.plan.findUnique({ where: { id: planId }, include: { modules: { select: { id: true } } } });
    const isYourModule = yourPlan?.modules.find(item => item.id == moduleId);
    if (isYourModule) {
      try {
        await this.prisma.module.update({ where: { id: moduleId }, data: { status: 'COMPLETED' } });
        return {message:'Module is successfully completed'}
      }catch{
        throw new InternalServerErrorException('Something went wrong!');
      }
    } else {
      throw new ForbiddenException();
    }
  }

}
