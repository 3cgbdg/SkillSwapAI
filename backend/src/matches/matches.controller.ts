import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AuthGuard } from '@nestjs/passport';
import { Match, Plan } from '@prisma/client';
import type { RequestWithUser } from 'types/auth';
import { ReturnDataType } from 'types/general';
import { IMatchResponse, IAvailableMatchItem } from 'types/matches';
@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body('otherId') otherId: string,
  ): Promise<ReturnDataType<Plan>> {
    if (!otherId || otherId.length == 0)
      throw new BadRequestException('No user id!');
    return this.matchesService.generateActiveMatch(req.user.id, otherId);
  }

  @Get('active')
  async getActiveMatches(
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<IMatchResponse[]>> {
    return this.matchesService.getActiveMatches(req.user.id);
  }

  @Get('available')
  async getAvailableMatches(
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<IAvailableMatchItem[]>> {
    return this.matchesService.getAvailableMatches(req.user.id);
  }
}
