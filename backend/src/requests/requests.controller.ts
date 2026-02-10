import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'types/auth';
import type { IReturnMessage, ReturnDataType } from 'types/general';

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<any>> {
    return this.requestsService.createForFriendship(
      createRequestDto,
      req.user.id,
    );
  }
  @Get()
  async findAll(@Req() req: RequestWithUser): Promise<ReturnDataType<any>> {
    return this.requestsService.findAll(req.user.id);
  }
  @Delete(':id')
  async deleteOne(@Param('id') requestId: string): Promise<IReturnMessage> {
    return this.requestsService.deleteOne(requestId);
  }
}
