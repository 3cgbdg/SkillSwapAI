import { User as PrismaUser, Skill as PrismaSkill } from '@prisma/client';
import { IGeneratedActiveMatch } from '../ai/ai.interface';

interface IUserForAi extends PrismaUser {
  knownSkills: PrismaSkill[];
  skillsToLearn: PrismaSkill[];
}

export class AiUtils {
  static parseAiResponse<T>(rawAiResponse: unknown): T | null {
    if (!rawAiResponse) return null;

    if (typeof rawAiResponse === 'string') {
      const match = rawAiResponse.match(/```json\s([\s\S]+?)```/);
      try {
        const jsonStr = match ? match[1] : rawAiResponse;
        return JSON.parse(jsonStr) as T;
      } catch (e) {
        console.error(
          'Error parsing AI response:',
          e,
          'Raw string:',
          rawAiResponse,
        );
        return null;
      }
    }

    return rawAiResponse as T;
  }

  static formatUserForAi(user: IUserForAi) {
    const skillsToLearn = user.skillsToLearn.map((s) => s.title);
    const knownSkills = user.knownSkills.map((s) => s.title);

    return {
      id: user.id,
      name: user.name || 'Anonymous',
      knownSkills: knownSkills.length ? knownSkills : ['General Discussion'],
      skillsToLearn: skillsToLearn.length ? skillsToLearn : ['New Insights'],
    };
  }
}
