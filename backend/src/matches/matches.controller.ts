import { Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Post()
  create(@Req() req: Request) {
    return this.matchesService.create((req as any).user.id);
  }
  @Get()
  getMatches(@Req() req: Request) {
    return this.matchesService.getMatches((req as any).user.id);
  }
}
