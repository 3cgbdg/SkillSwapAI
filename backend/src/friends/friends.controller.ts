import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'types/auth';
@Controller('friends')
@UseGuards(AuthGuard('jwt'))
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  async create(
    @Body() createFriendDto: CreateFriendDto,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.create(createFriendDto, req.user.id);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.friendsService.findAll(req.user.id);
  }

  @Get('online-status')
  async getOnlineFriends(@Req() req: RequestWithUser): Promise<string[]> {
    return this.friendsService.getOnlineFriends(req.user.id);
  }
}
