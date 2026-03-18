import { Controller, Get, Param, UseGuards, Patch } from '@nestjs/common';
import { PlansService } from './plans.service';
import { AuthGuard } from '@nestjs/passport';
import { IModuleUpdateResponse } from 'types/plans';

@Controller('plans')
@UseGuards(AuthGuard('jwt'))
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get(':id')
  async getPlan(@Param('id') matchId: string) {
    return this.plansService.getPlan(matchId);
  }

  @Patch(':planId/modules/:moduleId/status/completed')
  async updateStatusToCompeted(
    @Param('planId') planId: string,
    @Param('moduleId') moduleId: string,
  ): Promise<IModuleUpdateResponse> {
    return this.plansService.updateStatusToCompeted(planId, moduleId);
  }
}
