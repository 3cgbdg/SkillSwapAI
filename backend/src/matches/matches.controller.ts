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
import { Match } from '@prisma/client';
import type { RequestWithUser } from 'types/auth';
@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body('otherId') otherId: string,
  ): Promise<{ match: Match; message: string }> {
    if (!otherId || otherId.length == 0)
      throw new BadRequestException('No user id!');
    return this.matchesService.generateActiveMatch(req.user.id, otherId);
  }

  @Get('active')
  async getActiveMatches(@Req() req: RequestWithUser) {
    return this.matchesService.getActiveMatches(req.user.id);
  }

  @Get('available')
  async getAvailableMatches(@Req() req: RequestWithUser) {
    return this.matchesService.getAvailableMatches(req.user.id);
  }
}
