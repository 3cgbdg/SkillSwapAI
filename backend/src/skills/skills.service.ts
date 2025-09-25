import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { getSkillsDto } from './dto/get-skills.dto';
import { addKnownSkillDto } from './dto/add-known_skills.dto';
import { addWantToLearnSkillDto } from './dto/add-want-to-learn_skills.dto';
import { deleteKnownSkillDto } from './dto/delete-known_skills.dto';
import { deleteWantToLearnSkillDto } from './dto/delete-want-to-learn_skills.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) { };

  async findAll(dto: getSkillsDto) {
    const skills = await this.prisma.skill.findMany({ where: { title: { contains: dto.chars, mode: 'insensitive' } } });
    return skills;
  }

  async addKnownSkill(userId: string, dto: addKnownSkillDto) {
    let skill = await this.prisma.skill.findUnique({ where: { title: dto.title } });
    if (!skill) {
      skill = await this.prisma.skill.create({ data: { title: dto.title } });
    }
    await this.prisma.user.update({ where: { id: userId }, data: { knownSkills: { connect: { id: skill.id } } } });
    return { message: "Successfully added!" }
  }

  async addWantToLearnSkill(userId: string, dto: addWantToLearnSkillDto) {
    let skill = await this.prisma.skill.findUnique({ where: { title: dto.title } });
    if (!skill) {
      skill = await this.prisma.skill.create({ data: { title: dto.title } });
    }
    await this.prisma.user.update({ where: { id: userId }, data: { skillsToLearn: { connect: { id: skill.id } } } });
    return { message: "Successfully added!" }
  }


  async deleteKnownSkill(userId: string, dto: deleteKnownSkillDto) {
    console.log(userId, dto)
    await this.prisma.user.update({ where: { id: userId }, data: { knownSkills: { disconnect: { title: dto.title } } } });
    return { message: "Successfully removed!" }
  }

  async deleteWantToLearnSkill(userId: string, dto: deleteWantToLearnSkillDto) {
    await this.prisma.user.update({ where: { id: userId }, data: { skillsToLearn: { disconnect: { title: dto.title } } } });
    return { message: "Successfully removed!" }
  }


}