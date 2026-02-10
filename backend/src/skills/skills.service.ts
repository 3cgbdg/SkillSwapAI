import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { getSkillsDto } from './dto/get-skills.dto';
import { SkillDto } from './dto/skills.dto';
import { User } from '@prisma/client';
import { IReturnMessage, ReturnDataType } from 'types/general';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: getSkillsDto): Promise<ReturnDataType<any[]>> {
    const skills = await this.prisma.skill.findMany({
      where: { title: { contains: dto.chars, mode: 'insensitive' } },
    });
    return { data: skills };
  }

  async addKnownSkill(userId: string, dto: SkillDto): Promise<IReturnMessage> {
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

  async addWantToLearnSkill(
    user: User,
    dto: SkillDto,
    aiGenerated: boolean,
  ): Promise<IReturnMessage> {
    let skill = await this.prisma.skill.findUnique({
      where: { title: dto.title },
    });
    if (!skill) {
      skill = await this.prisma.skill.create({ data: { title: dto.title } });
    }

    if (aiGenerated) {
      try {
        let aiSuggestionSkills = user.aiSuggestionSkills;

        if (!aiSuggestionSkills) {
          const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { aiSuggestionSkills: true },
          });
          aiSuggestionSkills = dbUser?.aiSuggestionSkills || [];
        }

        const updatedAISuggestions = aiSuggestionSkills.filter(
          (item) => item !== dto.title,
        );

        await this.prisma.user.update({
          where: { id: user.id },
          data: { aiSuggestionSkills: updatedAISuggestions },
        });
      } catch (error) {
        console.error('Error updating AI suggestions:', error);
        throw new InternalServerErrorException(
          'Failed to update AI suggestions',
        );
      }
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { skillsToLearn: { connect: { id: skill.id } } },
    });
    return { message: 'Successfully added!' };
  }

  async deleteKnownSkill(
    userId: string,
    dto: SkillDto,
  ): Promise<IReturnMessage> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { knownSkills: { disconnect: { title: dto.title } } },
    });
    return { message: 'Successfully removed!' };
  }

  async deleteWantToLearnSkill(
    userId: string,
    dto: SkillDto,
  ): Promise<IReturnMessage> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { skillsToLearn: { disconnect: { title: dto.title } } },
    });
    return { message: 'Successfully removed!' };
  }
}
