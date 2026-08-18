import { Controller, Get, Param, UseGuards, Patch, Req } from '@nestjs/common';
import { PlansService } from './plans.service';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'types/auth';
import { IModuleUpdateResponse } from 'types/plans';

@Controller('plans')
@UseGuards(AuthGuard('jwt'))
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get(':id')
  async getPlan(@Param('id') matchId: string, @Req() req: RequestWithUser) {
    return this.plansService.getPlan(matchId, req.user.id);
  }

  @Patch(':planId/modules/:moduleId/status/completed')
  async updateStatusToCompeted(
    @Param('planId') planId: string,
    @Param('moduleId') moduleId: string,
    @Req() req: RequestWithUser,
  ): Promise<IModuleUpdateResponse> {
    return this.plansService.updateStatusToCompeted(
      planId,
      moduleId,
      req.user.id,
    );
  }
}
