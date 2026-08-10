import {
  User as PrismaUser,
  Skill as PrismaSkill,
} from '../prisma/prisma-exports.js';

interface IUserForAi extends PrismaUser {
  knownSkills: PrismaSkill[];
  skillsToLearn: PrismaSkill[];
}

export class AiUtils {
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
