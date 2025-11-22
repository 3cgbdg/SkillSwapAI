import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';

import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('requests')
@UseGuards(AuthGuard("jwt"))
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) { }

  @Post()
  async create(@Body() createRequestDto: CreateRequestDto, @Req() req: Request): Promise<{ message: string }> {
    return this.requestsService.createForFriendship(createRequestDto, (req as any).user.id);
  }
  @Get()
  async findAll(@Req() req: Request) {
    return this.requestsService.findAll((req as any).user.id);
  }
  @Delete(':id')
  async deleteOne(@Param('id') requestId: string) {
    return this.requestsService.deleteOne(requestId);
  }

}
