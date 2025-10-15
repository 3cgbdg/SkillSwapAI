import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService, private readonly httpService: HttpService) { };
  async create(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { skillsToLearn: true, knownSkills: true } });
    if (!user) throw new NotFoundException('User was not found!');
    const skillsToLearnTitles = user.skillsToLearn.map(skill => skill.title);
    const knownSkillsTitles = user.knownSkills.map(skill => skill.title);
    const users = await this.prisma.user.findMany({ where: { knownSkills: { some: { title: { in: skillsToLearnTitles } } } }, include: { knownSkills: true, skillsToLearn: true } });

    const sortedUsers = users
      .map(user => {
        const knowsMySkills = user.knownSkills.some(skill =>
          skillsToLearnTitles.includes(skill.title)
        );
        const wantsMySkills = user.skillsToLearn.some(skill =>
          knownSkillsTitles.includes(skill.title)
        );
        const score = (knowsMySkills ? 1 : 0) + (wantsMySkills ? 1 : 0);
        return { ...user, skillsToLearn: user.skillsToLearn.map(skill => skill.title), knownSkills: user.knownSkills.map(skill => skill.title), score };
      })
      .sort((a, b) => b.score - a.score);
    const usersForMatch = sortedUsers.slice(0, 9);
    console.log(usersForMatch)
    try {

      const fastApiResponse = await firstValueFrom(
        this.httpService.post(`${this.configService.get<string>('FASTAPI_URL')}/analyze/${userId}`,
          { usersForMatch: usersForMatch, thisUser: { ...user, knownSkills: knownSkillsTitles, skillsToLearn: skillsToLearnTitles } },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          })
      );
       const aiRaw = fastApiResponse?.data?.AIReport;
      console.log(aiRaw)
    } catch (error) {
      throw new HttpException(
        error?.response?.data || 'AI service error',
        error?.status || 500
      )
    }

  }

}
