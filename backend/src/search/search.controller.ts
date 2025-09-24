import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { getSearchDto } from './dto/get-search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }
  @Get()
  async findAll(@Query() dto: getSearchDto) {
    return this.searchService.findAll(dto);
  }
}
