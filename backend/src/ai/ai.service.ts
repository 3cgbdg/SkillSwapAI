import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { IGeneratedActiveMatch } from './ai.interface';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService, private readonly httpService: HttpService, private readonly configService: ConfigService) { };
  async generateBodyForActiveMatch(myId: string, otherId: string): Promise<{ generatedData: IGeneratedActiveMatch, other: User } | null> {
    if (!myId || myId.length == 0 || !otherId || otherId.length == 0) {
      throw new BadRequestException();
    }
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: [myId, otherId],
        },
      },
      include: { skillsToLearn: true, knownSkills: true }
    });

    if (users.length == 2) {

      const updatedSkillsBodyUsers = users.map((item) => {
        const skillsToLearn = item.skillsToLearn.map((skill) => skill.title);
        const knownSkills = item.knownSkills.map((skill) => skill.title);

        return {
          id: item.id,
          name: item.name,
          knownSkills,
          skillsToLearn,
        };
      });
      const fastApiResponse = await firstValueFrom(
        this.httpService.post(`${this.configService.get<string>('FASTAPI_URL')}/match/active`, { user1: users[0].id == myId ? updatedSkillsBodyUsers[0] : updatedSkillsBodyUsers[1], user2: users[0].id !== myId ? updatedSkillsBodyUsers[0] : updatedSkillsBodyUsers[1] },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          })
      );

      const rawAiArray = fastApiResponse?.data?.AIReport;
      let readyAiArray: IGeneratedActiveMatch | null = this._parseAiResponse<IGeneratedActiveMatch>(rawAiArray);

      return readyAiArray ? { generatedData: readyAiArray, other: users[0].id == myId ? users[1] : users[0] } : null
    } else {
      throw new BadRequestException();
    }
  }


  async getAiSuggestionSkills(myId: string): Promise<{ skills: string[], message: string } | null> {
    if (!myId || myId.length == 0) {
      throw new BadRequestException();
    }
    const user = await this.prisma.user.findUnique({ where: { id: myId }, include: { skillsToLearn: true, knownSkills: true } });
    if (user?.lastSkillsGenerationDate) {
      const lastDate = new Date(user.lastSkillsGenerationDate);
      const now = new Date();

      const hoursDiff = (now.getTime() - lastDate.getTime()) / (3600 * 24);
      if (hoursDiff < 24) {
        throw new ForbiddenException("You have already regenerated skills. Wait till the next day.")
      }
    }
    if (!user)
      throw new UnauthorizedException();
    const stringArraySkillsToLearn = user?.skillsToLearn.map(item => item.title)
    const stringArrayKnownSkills = user?.knownSkills.map(item => item.title)

    const fastApiResponse = await firstValueFrom(
      this.httpService.post(`${this.configService.get<string>('FASTAPI_URL')}/profile/skills`, { skillsToLearn: stringArraySkillsToLearn, knownSkills: stringArrayKnownSkills },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        })
    );

    const rawAiArray = fastApiResponse?.data?.AIReport;
    let readyAiArray: string[] | null = this._parseAiResponse<string[]>(rawAiArray);
    if (readyAiArray && readyAiArray.length > 0) {
      Promise.all(readyAiArray.map(async (skill) => {
        await this.prisma.skill.upsert({ where: { title: skill }, update: {}, create: { title: skill } });
      }))
      await this.prisma.user.update({ where: { id: myId }, data: { aiSuggestionSkills: readyAiArray } });
    }
    const returnAiArray = readyAiArray?.filter(item => !stringArraySkillsToLearn.includes(item));
    // updating our flag for tracking last date for using this api by user (limit 1 per day (except automized regeneration after signing up))
    await this.prisma.user.update({ where: { id: myId }, data: { lastSkillsGenerationDate: new Date() } });
    return returnAiArray ? { skills: returnAiArray, message: 'Skills successfully generated!' } : null;
  }

  // private generic func  for parsing income ai response object
  private _parseAiResponse<T>(rawAiResponse: any): T | null {
    if (!rawAiResponse) return null;
    if (typeof rawAiResponse == 'string') {
      const str = rawAiResponse.match(/```json\s([\s\S]+?)```/)
      return str ? JSON.parse(str[1]) : JSON.parse(rawAiResponse);
    } else {
      return rawAiResponse;
    }

  }
}
