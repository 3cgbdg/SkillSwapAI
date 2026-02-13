import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GetSkillsDto } from './dto/GetSkillsDto';
import { SkillDto } from './dto/skills.dto';
import { User } from '@prisma/client';
import { IReturnMessage, ReturnDataType } from 'types/general';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(dto: GetSkillsDto): Promise<ReturnDataType<any[]>> {
    const skills = await this.prisma.skill.findMany({
      where: { title: { contains: dto.chars, mode: 'insensitive' } },
    });
    return { data: skills };
  }

  async addKnownSkill(userId: string, dto: SkillDto): Promise<IReturnMessage> {
    const skill = await this.findOrCreateSkill(dto.title);

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
    const skill = await this.findOrCreateSkill(dto.title);

    if (aiGenerated) {
      await this.clearAISuggestion(user, dto.title);
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

  private async findOrCreateSkill(title: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { title },
    });

    if (skill) return skill;

    return this.prisma.skill.create({
      data: { title },
    });
  }

  private async clearAISuggestion(user: User, skillTitle: string) {
    try {
      const aiSuggestionSkills = user.aiSuggestionSkills ||
        (await this.getUserAISuggestions(user.id));

      const updatedSuggestions = aiSuggestionSkills.filter(
        (suggestion) => suggestion !== skillTitle,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: { aiSuggestionSkills: updatedSuggestions },
      });
    } catch (error) {
      console.error('Error updating AI suggestions:', error);
      throw new InternalServerErrorException('Failed to update AI suggestions');
    }
  }

  private async getUserAISuggestions(userId: string): Promise<string[]> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { aiSuggestionSkills: true },
    });
    return dbUser?.aiSuggestionSkills || [];
  }
}
