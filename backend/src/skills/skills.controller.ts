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
import { getSkillsDto } from './dto/get-skills.dto';
import { AuthGuard } from '@nestjs/passport';
import { SkillDto } from './dto/skills.dto';
import type { RequestWithUser } from 'types/auth';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(@Query() dto: getSkillsDto) {
    return this.skillsService.findAll(dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('known')
  async addKnownSkill(@Req() req: RequestWithUser, @Body() dto: SkillDto) {
    return this.skillsService.addKnownSkill(req.user.id, dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('want-to-learn')
  async addWantToLearnSkill(
    @Req() req: RequestWithUser,
    @Body() dto: SkillDto,
    @Query('ai') aiGenerated: boolean,
  ) {
    return this.skillsService.addWantToLearnSkill(req.user, dto, aiGenerated);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('known')
  async deleteKnownSkill(@Req() req: RequestWithUser, @Query() dto: SkillDto) {
    return this.skillsService.deleteKnownSkill(req.user.id, dto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete('want-to-learn')
  async deleteWantToLearnSkill(
    @Req() req: RequestWithUser,
    @Query() dto: SkillDto,
  ) {
    return this.skillsService.deleteWantToLearnSkill(req.user.id, dto);
  }
}
