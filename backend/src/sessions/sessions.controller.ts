import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';


@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) { }

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto, @Req() req: Request) {
    return this.sessionService.create(createSessionDto, (req as any).user.id);

  }

  @Get()
  async findAll(@Query('month') month: string, @Req() req: Request) {
    return this.sessionService.findAll(Number(month), (req as any).user.id)
  }
  @Post(':id/accepted')
  async acceptSessionRequest(@Param('id') sessionId: string, @Body() dto: UpdateSessionStatusDto, @Req() req: Request) {
    return this.sessionService.acceptSessionRequest(dto, (req as any).user.id, sessionId)
  }


  @Post(':id/rejected')
  async rejectSessionRequest(@Param('id') sessionId: string, @Body() dto: UpdateSessionStatusDto, @Req() req: Request) {
    return this.sessionService.rejectSessionRequest(dto, (req as any).user.id, sessionId)
  }



}
