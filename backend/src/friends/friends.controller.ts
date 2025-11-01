import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
@Controller('friends')
@UseGuards(AuthGuard("jwt"))
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) { }

  @Post()
  async create(@Body() createFriendDto: CreateFriendDto, @Req() req: Request) {
    return this.friendsService.create(createFriendDto, (req as any).user.id);
  }

  @Get()
  async findAll(@Req() req: Request) {
    return this.friendsService.findAll((req as any).user.id);
  }


  

  


}
