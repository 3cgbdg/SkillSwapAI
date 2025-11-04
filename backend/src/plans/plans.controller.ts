import { Controller, Get, Post, Param, Req, UseGuards, Patch } from '@nestjs/common';
import { PlansService } from './plans.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('plans')
@UseGuards(AuthGuard("jwt"))
export class PlansController {
  constructor(private readonly plansService: PlansService) { }


  @Get(':id')
  async getPlan(@Param('id') matchId: string) {
    return this.plansService.getPlan(matchId);
  }

  @Patch(':planId/modules/:moduleId/status/completed')
  async updateStatusToCompeted(@Param('planId') planId: string,
    @Param('moduleId') moduleId: string) {
    return this.plansService.updateStatusToCompeted(planId,moduleId);
  }






}
