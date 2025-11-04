import { BadRequestException, Injectable } from '@nestjs/common';
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
      let readyAiArray: IGeneratedActiveMatch | null = null;
      if (typeof rawAiArray == 'string') {
        const str = rawAiArray.match(/```json\s([\s\S]+?)```/)
        readyAiArray = str ? JSON.parse(str[1]) : JSON.parse(rawAiArray);
      } else {
        readyAiArray = rawAiArray;
      }
      return readyAiArray ? { generatedData: readyAiArray, other: users[0].id == myId ? users[1] : users[0] } : null
    } else {
      throw new BadRequestException();
    }
  }
}
