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
import type { ReturnDataType } from 'types/general';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) { }

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<any>> {
    return this.sessionService.create(createSessionDto, req.user.id);
  }

  @Get()
  async findAll(
    @Query('month') month: string,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<any[]>> {
    return this.sessionService.findAll(Number(month), req.user.id);
  }

  @Get('today')
  async findTodaysSessions(
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<any[]>> {
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
