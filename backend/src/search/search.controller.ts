import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { getSearchDto } from './dto/get-search.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'types/auth';
import type { ReturnDataType } from 'types/general';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Query() dto: getSearchDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<any[]>> {
    return this.searchService.findAll(dto, req.user.id);
  }
}
