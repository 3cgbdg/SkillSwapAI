import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AuthGuard } from '@nestjs/passport';
import { GetChatDto } from './dto/get-chat.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import type { RequestWithUser } from 'types/auth';
import { ReturnDataType } from 'types/general';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) { }
  @Get()
  async findAll(@Req() req: RequestWithUser): Promise<ReturnDataType<any>> {
    return this.chatsService.findAll(req.user.id);
  }

  @Get('messages')
  async findOne(
    @Query() dto: GetChatDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<any[]>> {
    return this.chatsService.findOne(req.user.id, dto.with);
  }

  @Post()
  async createChat(
    @Body() dto: CreateChatDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<any>> {
    return this.chatsService.createChat(dto, req.user.id);
  }
}
