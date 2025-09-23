import { Controller, Get, Post, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { getSkillsDto } from './dto/get-skills.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }
  @Get()
  async findAll(@Query() dto: getSkillsDto) {
    return this.skillsService.findAll(dto);
  }


}

