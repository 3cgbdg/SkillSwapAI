import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import type { RequestWithUser } from 'types/auth';
import type { ReturnDataType } from 'types/general';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<unknown>> {
    return this.sessionService.create(createSessionDto, req.user.id);
  }

  @Get()
  async findAll(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('month') month: string | undefined,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<unknown[]>> {
    if (from && to) {
      return this.sessionService.findAll(from, to, req.user.id);
    }
    if (month !== undefined && month !== '') {
      const m = Number(month);
      if (Number.isNaN(m) || m < 0 || m > 11) {
        throw new BadRequestException('Invalid month');
      }
      const year = new Date().getFullYear();
      const fromLegacy = new Date(year, m, 1).toISOString();
      const toLegacy = new Date(year, m + 1, 0, 23, 59, 59, 999).toISOString();
      return this.sessionService.findAll(fromLegacy, toLegacy, req.user.id);
    }
    throw new BadRequestException('from and to query params are required');
  }

  @Get('today')
  async findTodaysSessions(
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<unknown[]>> {
    return this.sessionService.findTodaysSessions(req.user.id);
  }
  @Post(':id/accepted')
  async acceptSessionRequest(
    @Param('id') sessionId: string,
    @Body() dto: UpdateSessionStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<string>> {
    return this.sessionService.acceptSessionRequest(
      dto,
      req.user.id,
      sessionId,
    );
  }

  @Post(':id/rejected')
  async rejectSessionRequest(
    @Param('id') sessionId: string,
    @Body() dto: UpdateSessionStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<string>> {
    return this.sessionService.rejectSessionRequest(
      dto,
      req.user.id,
      sessionId,
    );
  }
}
