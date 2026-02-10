import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { IGeneratedActiveMatch } from 'src/ai/ai.interface';

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }
  async getPlan(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        plan: { include: { modules: { include: { resources: true } } } },
      },
    });
    if (!match) {
      throw new NotFoundException('Match was not found!');
    }

    return { data: match.plan };
  }

  async createPlan(matchId: string, modules: IGeneratedActiveMatch['modules']) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        other: {
          select: {
            knownSkills: true,
            skillsToLearn: true,
            name: true,
            id: true,
          },
        },
        plan: { select: { id: true } },
        initiator: {
          select: {
            knownSkills: true,
            skillsToLearn: true,
            name: true,
            id: true,
          },
        },
      },
    });
    if (!match) throw new NotFoundException('Match was not found!');
    if (match.plan && match.plan.id)
      throw new ForbiddenException('Plan has been already created!');
    // const initiator = { ...match.initiator, skillsToLearn: match.initiator.skillsToLearn.map(item => item.title), knownSkills: match.initiator.knownSkills.map(item => item.title) }
    // const other = { ...match.other, skillsToLearn: match.other.skillsToLearn.map(item => item.title), knownSkills: match.other.knownSkills.map(item => item.title) }

    const plan = await this.prisma.plan.create({
      data: {
        match: { connect: { id: match.id } },
        modules: {
          create: modules.map((module) => ({
            title: module.title,
            status: module.status,
            objectives: module.objectives,
            activities: module.activities,
            timeline: module.timeline,
            resources: {
              create: module.resources.map((res) => ({
                title: res.title,
                description: res.description,
                link: res.link,
              })),
            },
          })),
        },
      },
      include: {
        modules: {
          include: {
            resources: true,
          },
        },
      },
    });
    return plan;
  }

  async updateStatusToCompeted(
    planId: string,
    moduleId: string,
  ): Promise<{ message: string; status: null | string }> {
    const yourPlan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: { modules: { select: { id: true, status: true } } },
    });
    const isAllCompleted = yourPlan?.modules.filter(
      (item) => item.status !== 'COMPLETED',
    );
    if (isAllCompleted?.length == 1) {
      await this.prisma.match.deleteMany({ where: { plan: { id: planId } } });
      return { message: 'Active match is completed', status: 'Finished' };
    }
    const isYourModule = isAllCompleted?.find((item) => item.id == moduleId);
    if (isYourModule) {
      try {
        await this.prisma.module.update({
          where: { id: moduleId },
          data: { status: 'COMPLETED' },
        });
        return { message: 'Module is successfully completed', status: null };
      } catch {
        throw new InternalServerErrorException('Something went wrong!');
      }
    } else {
      throw new ForbiddenException();
    }
  }
}
