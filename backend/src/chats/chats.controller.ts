import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AuthGuard } from '@nestjs/passport';
import { GetChatDto } from './dto/get-chat.dto';
import type { Request } from 'express';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) { }

  @Get()
  async findAll(@Req() req: Request) {
    return this.chatsService.findAll((req as any).user.id);
  }


  @Get("messages")
  async findOne(@Query() dto: GetChatDto, @Req() req: Request) {
    return this.chatsService.findOne((req as any).user.id, dto.with);
  }

  


}
