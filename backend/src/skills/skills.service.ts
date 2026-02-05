import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { getSkillsDto } from './dto/get-skills.dto';
import { SkillDto } from './dto/skills.dto';
import { User } from '@prisma/client';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: getSkillsDto) {
    const skills = await this.prisma.skill.findMany({
      where: { title: { contains: dto.chars, mode: 'insensitive' } },
    });
    return skills;
  }

  async addKnownSkill(userId: string, dto: SkillDto) {
    let skill = await this.prisma.skill.findUnique({
      where: { title: dto.title },
    });
    if (!skill) {
      skill = await this.prisma.skill.create({ data: { title: dto.title } });
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { knownSkills: { connect: { id: skill.id } } },
    });
    return { message: 'Successfully added!' };
  }

  async addWantToLearnSkill(user: User, dto: SkillDto, aiGenerated: boolean) {
    let skill = await this.prisma.skill.findUnique({
      where: { title: dto.title },
    });
    if (!skill) {
      skill = await this.prisma.skill.create({ data: { title: dto.title } });
    }

    if (aiGenerated) {
      try {
        const updatedAISuggestions = user.aiSuggestionSkills.filter(
          (item) => item !== dto.title,
        );
        if (!user) throw new Error('User not found');
        await this.prisma.user.update({
          where: { id: user.id },
          data: { aiSuggestionSkills: updatedAISuggestions },
        });
      } catch {
        throw new InternalServerErrorException();
      }
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { skillsToLearn: { connect: { id: skill.id } } },
    });
    return { message: 'Successfully added!' };
  }

  async deleteKnownSkill(userId: string, dto: SkillDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { knownSkills: { disconnect: { title: dto.title } } },
    });
    return { message: 'Successfully removed!' };
  }

  async deleteWantToLearnSkill(userId: string, dto: SkillDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { skillsToLearn: { disconnect: { title: dto.title } } },
    });
    return { message: 'Successfully removed!' };
  }
}
