import { Controller, Post, UseGuards, Req, Get, Body, Param, BadRequestException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AuthGuard } from '@nestjs/passport';
import { Match } from '@prisma/client';
@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Post()
  async create(@Req() req: Request, @Body('otherId') otherId: string): Promise<{match:Match,message:string}> {
    if (!otherId || otherId.length == 0)
      throw new BadRequestException("No user id!");
    return this.matchesService.generateActiveMatch((req as any).user.id, otherId);
  }

  @Get('active')
  async getActiveMatches(@Req() req: Request) {
    return this.matchesService.getActiveMatches((req as any).user.id);
  }

  @Get('available')
  async getAvailableMatches(@Req() req: Request) {
    return this.matchesService.getAvailableMatches((req as any).user.id);
  }

}
