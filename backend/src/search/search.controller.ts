import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { getSearchDto } from './dto/get-search.dto';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }
  @Get()
  @UseGuards(AuthGuard("jwt"))
  async findAll(@Query() dto: getSearchDto, @Req() req: Request) {
    return this.searchService.findAll(dto, (req as any).user.id);
  }
}
