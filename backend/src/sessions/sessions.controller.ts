import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import type { RequestWithUser } from 'types/auth';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; session: any }> {
    return this.sessionService.create(createSessionDto, req.user.id);
  }

  @Get()
  async findAll(@Query('month') month: string, @Req() req: RequestWithUser) {
    return this.sessionService.findAll(Number(month), req.user.id);
  }

  @Get('today')
  async findTodaysSessions(
    @Query('month') month: string,
    @Req() req: RequestWithUser,
  ) {
    return this.sessionService.findTodaysSessions(req.user.id);
  }
  @Post(':id/accepted')
  async acceptSessionRequest(
    @Param('id') sessionId: string,
    @Body() dto: UpdateSessionStatusDto,
    @Req() req: RequestWithUser,
  ) {
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
  ) {
    return this.sessionService.rejectSessionRequest(
      dto,
      req.user.id,
      sessionId,
    );
  }
}
