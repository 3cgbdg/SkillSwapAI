import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { IGeneratedActiveMatch } from 'src/ai/ai.interface';
import { ReturnDataType } from 'types/general';
import { IModuleUpdateResponse } from 'types/plans';
import { PlansUtils } from 'src/utils/plans.utils';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}
  async getPlan(matchId: string): Promise<ReturnDataType<Plan>> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        plan: PlansUtils.planInclude(),
      },
    });
    if (!match) throw new NotFoundException('Match was not found!');

    return { data: match.plan as Plan };
  }

  async createPlan(
    matchId: string,
    modules: IGeneratedActiveMatch['modules'],
  ): Promise<Plan> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        plan: { select: { id: true } },
      },
    });
    if (!match) throw new NotFoundException('Match was not found!');
    if (match.plan?.id)
      throw new ForbiddenException('Plan has been already created!');

    return this.prisma.plan.create({
      data: {
        match: { connect: { id: match.id } },
        modules: {
          create: modules.map((m) => ({
            title: m.title,
            status: m.status,
            objectives: m.objectives,
            activities: m.activities,
            timeline: m.timeline,
            resources: {
              create: m.resources.map((res) => ({
                title: res.title,
                description: res.description,
                link: res.link,
              })),
            },
          })),
        },
      },
      include: PlansUtils.planInclude().include,
    });
  }

  async updateStatusToCompeted(
    planId: string,
    moduleId: string,
  ): Promise<IModuleUpdateResponse> {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: { modules: { select: { id: true, status: true } } },
    });

    if (!plan) throw new NotFoundException('Plan not found');

    const remainingModules = plan.modules.filter(
      (m) => m.status !== 'COMPLETED',
    );

    if (remainingModules.length === 1 && remainingModules[0].id === moduleId) {
      await this.prisma.match.deleteMany({ where: { plan: { id: planId } } });
      return { message: 'Active match is completed', status: 'Finished' };
    }

    const moduleToUpdate = remainingModules.find((m) => m.id === moduleId);
    if (!moduleToUpdate)
      throw new ForbiddenException('Module not found or already completed');

    try {
      await this.prisma.module.update({
        where: { id: moduleId },
        data: { status: 'COMPLETED' },
      });
      return { message: 'Module is successfully completed', status: null };
    } catch {
      throw new InternalServerErrorException('Something went wrong!');
    }
  }
}
