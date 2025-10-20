import { Controller, Post, UseGuards, Req, Get, Body, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Post()
  async create(@Req() req: Request) {
    return this.matchesService.create((req as any).user.id);
  }

  @Post('plan')
  async createPlan(@Req() req: Request) {
    return this.matchesService.createPlan((req as any).user.id);
  }
    @Get(':id/plan')
  async getPlan(@Param('id') matchId:string) {
    return this.matchesService.getPlan(matchId);
  }

  @Get()
  async getMatches(@Req() req: Request) {
    return this.matchesService.getMatches((req as any).user.id);
  }
}
