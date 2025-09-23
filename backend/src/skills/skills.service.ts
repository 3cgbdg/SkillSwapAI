import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { getSkillsDto } from './dto/get-skills.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) { };

  async findAll(dto: getSkillsDto) {
    const skills = await this.prisma.skill.findMany({ where: { title: { contains: dto.chars, mode: 'insensitive' } } });
    const arrayOfTitles = skills.map(item=>item.title);
    return arrayOfTitles;
  }


}