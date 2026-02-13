import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { GetSkillsDto } from './dto/GetSkillsDto';
import { AuthGuard } from '@nestjs/passport';
import { SkillDto } from './dto/skills.dto';
import type { RequestWithUser } from 'types/auth';
import type { IReturnMessage, ReturnDataType } from 'types/general';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Get()
  async findAll(@Query() dto: GetSkillsDto): Promise<ReturnDataType<any[]>> {
    return this.skillsService.findAll(dto);
  }

  @Post('known')
  @UseGuards(AuthGuard('jwt'))
  async addKnownSkill(
    @Req() req: RequestWithUser,
    @Body() dto: SkillDto,
  ): Promise<IReturnMessage> {
    return this.skillsService.addKnownSkill(req.user.id, dto);
  }

  @Post('want-to-learn')
  @UseGuards(AuthGuard('jwt'))
  async addWantToLearnSkill(
    @Req() req: RequestWithUser,
    @Body() dto: SkillDto,
    @Query('ai') aiGenerated: boolean,
  ): Promise<IReturnMessage> {
    return this.skillsService.addWantToLearnSkill(req.user, dto, aiGenerated);
  }

  @Delete('known')
  @UseGuards(AuthGuard('jwt'))
  async deleteKnownSkill(
    @Req() req: RequestWithUser,
    @Query() dto: SkillDto,
  ): Promise<IReturnMessage> {
    return this.skillsService.deleteKnownSkill(req.user.id, dto);
  }

  @Delete('want-to-learn')
  @UseGuards(AuthGuard('jwt'))
  async deleteWantToLearnSkill(
    @Req() req: RequestWithUser,
    @Query() dto: SkillDto,
  ): Promise<IReturnMessage> {
    return this.skillsService.deleteWantToLearnSkill(req.user.id, dto);
  }
}
