import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { getSkillsDto } from './dto/get-skills.dto';
import { AuthGuard } from '@nestjs/passport';
import { addKnownSkillDto } from './dto/add-known_skills.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Get()
  async findAll(@Query() dto: getSkillsDto) {
    return this.skillsService.findAll(dto);
  }

  @Post("known")
  async addKnownSkill(@Req() req: Request, @Body() dto: addKnownSkillDto) {
    return this.skillsService.addKnownSkill((req as any).user.id, dto);
  }
  @Post("want-to-learn")
  async addWantToLearnSkill(@Req() req: Request, @Body() dto: addKnownSkillDto) {
    return this.skillsService.addWantToLearnSkill((req as any).user.id, dto);
  }


  @Delete("known")
  async deleteKnownSkill(@Req() req: Request, @Query() dto: addKnownSkillDto) {
    return this.skillsService.deleteKnownSkill((req as any).user.id, dto);
  }

  @Delete("want-to-learn")
  async deleteWantToLearnSkill(@Req() req: Request, @Query() dto: addKnownSkillDto) {
    return this.skillsService.deleteWantToLearnSkill((req as any).user.id, dto);
  }
}

