import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) { }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async create(@Body() createRequestDto: CreateRequestDto, @Req() req: Request) {
    return this.requestsService.create(createRequestDto, (req as any).user.id);
  }
  @Get()
  @UseGuards(AuthGuard("jwt"))
  async findAll(@Req() req: Request) {
    return this.requestsService.findAll((req as any).user.id);
  }

}
