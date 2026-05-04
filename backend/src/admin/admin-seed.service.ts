import { Injectable, Logger } from '@nestjs/common';
import { Skill } from '../prisma/prisma-exports.js';
import { PrismaService } from 'prisma/prisma.service';
import { faker } from '@faker-js/faker';

const TECHNICAL_SKILLS = [
  'TypeScript',
  'Node.js',
  'React',
  'Next.js',
  'PostgreSQL',
  'Prisma ORM',
  'Docker',
  'Kubernetes',
  'AWS',
  'GraphQL',
  'Redis',
  'NestJS',
  'Tailwind CSS',
  'Git',
  'CI/CD',
  'Python',
  'Machine Learning',
  'Unit Testing',
  'System Design',
  'Microservices',
  'Security',
  'API Design',
  'WebSockets',
  'Terraform',
  'Elasticsearch',
  'Vue.js',
  'Angular',
  'Rust',
  'Go',
  'Swift',
  'Kotlin',
  'Flutter',
  'React Native',
  'MongoDB',
  'Firebase',
  'Linux Administration',
  'DevOps',
  'Data Engineering',
  'Computer Vision',
  'Natural Language Processing',
];

const GENERAL_SKILLS = [
  'Public Speaking',
  'Cooking',
  'Photography',
  'Graphic Design',
  'Project Management',
  'Foreign Languages',
  'Writing',
  'Yoga',
  'Financial Literacy',
  'Gardening',
  'Chess',
  'Painting',
  'First Aid',
  'Negotiation',
  'Digital Marketing',
  'Critical Thinking',
  'Video Editing',
  'Music Production',
  'Carpentry',
  'Meditation',
  'Time Management',
  'Illustration',
  'Surfing',
  'Baking',
  'Car Maintenance',
];

const CREATIVE_SKILLS = [
  '3D Modeling',
  'Animation',
  'UX/UI Design',
  'Calligraphy',
  'Creative Writing',
  'Podcasting',
  'Film Making',
  'Interior Design',
  'Fashion Design',
  'Song Writing',
];

const LANGUAGE_SKILLS = [
  'Spanish',
  'French',
  'Mandarin Chinese',
  'Japanese',
  'German',
  'Korean',
  'Arabic',
  'Portuguese',
  'Italian',
  'Sign Language',
];

const FITNESS_SKILLS = [
  'Weight Training',
  'Marathon Running',
  'Rock Climbing',
  'Swimming',
  'Martial Arts',
  'Dance',
  'Pilates',
  'Cycling',
  'Boxing',
  'Calisthenics',
];

const BUSINESS_SKILLS = [
  'Entrepreneurship',
  'Sales',
  'SEO',
  'Content Strategy',
  'Product Management',
  'Data Analysis',
  'Accounting',
  'Leadership',
  'Public Relations',
  'Supply Chain Management',
];

const BOT_BIOS = [
  'Passionate learner always looking to swap skills and grow together.',
  'Tech enthusiast by day, creative thinker by night.',
  "Love teaching what I know and learning what I don't!",
  'Believe in the power of peer-to-peer learning.',
  'On a mission to master 10 skills before I turn 30.',
  'Jack of many trades, looking to become master of a few.',
  'Life-long learner with a knack for making things click.',
  'Here to connect, collaborate, and grow.',
  'Curious mind with a love for sharing knowledge.',
  'Looking for study buddies and skill-swap partners!',
  'Always up for a challenge and a new skill.',
  "Let's learn something awesome together!",
  'Ready to teach, eager to learn.',
  'Building skills one swap at a time.',
  'Knowledge is best when shared.',
];

const BOT_COUNT = 150;

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    this.logger.log('Starting bot seed...');

    // 1. Clean up only bot users and their relations (safe for prod!)
    const botUsers = await this.prisma.user.findMany({
      where: { isBot: true },
      select: { id: true },
    });
    const botIds = botUsers.map((u) => u.id);

    if (botIds.length > 0) {
      this.logger.log(`Cleaning ${botIds.length} existing bot users...`);

      // Delete matches involving bots
      await this.prisma.match.deleteMany({
        where: {
          OR: [{ initiatorId: { in: botIds } }, { otherId: { in: botIds } }],
        },
      });

      // Delete friendships involving bots
      await this.prisma.friendship.deleteMany({
        where: {
          OR: [{ user1Id: { in: botIds } }, { user2Id: { in: botIds } }],
        },
      });

      // Delete requests involving bots
      await this.prisma.request.deleteMany({
        where: {
          OR: [{ fromId: { in: botIds } }, { toId: { in: botIds } }],
        },
      });

      // Delete messages involving bots
      await this.prisma.message.deleteMany({
        where: {
          OR: [{ fromId: { in: botIds } }, { toId: { in: botIds } }],
        },
      });

      // Delete the bot users themselves
      await this.prisma.user.deleteMany({
        where: { isBot: true },
      });
    }

    // 2. Upsert skills (create if not exists, keep existing)
    const allSkillTitles = [
      ...new Set([
        ...TECHNICAL_SKILLS,
        ...GENERAL_SKILLS,
        ...CREATIVE_SKILLS,
        ...LANGUAGE_SKILLS,
        ...FITNESS_SKILLS,
        ...BUSINESS_SKILLS,
      ]),
    ];

    this.logger.log(`Upserting ${allSkillTitles.length} skills...`);
    const skills: Skill[] = [];
    for (const title of allSkillTitles) {
      const skill = await this.prisma.skill.upsert({
        where: { title },
        update: {},
        create: { title },
      });
      skills.push(skill);
    }

    // 3. Create bot users
    this.logger.log(`Creating ${BOT_COUNT} bot users...`);
    const usedNames = new Set<string>();
    const usedEmails = new Set<string>();
    let created = 0;

    for (let i = 0; i < BOT_COUNT; i++) {
      let name: string;
      do {
        name = faker.person.fullName();
      } while (usedNames.has(name));
      usedNames.add(name);

      let email: string;
      do {
        email = faker.internet.email({
          firstName: name.split(' ')[0],
          lastName: name.split(' ')[1] || `bot${i}`,
        });
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const knownCount = faker.number.int({ min: 3, max: 7 });
      const learnCount = faker.number.int({ min: 3, max: 7 });
      const shuffled = [...skills].sort(() => 0.5 - Math.random());

      await this.prisma.user.create({
        data: {
          isBot: true,
          email,
          name,
          password: 'bot_account_no_login',
          bio: BOT_BIOS[faker.number.int({ min: 0, max: BOT_BIOS.length - 1 })],
          imageUrl: null,
          knownSkills: {
            connect: shuffled.slice(0, knownCount).map((s) => ({ id: s.id })),
          },
          skillsToLearn: {
            connect: shuffled
              .slice(knownCount, knownCount + learnCount)
              .map((s) => ({ id: s.id })),
          },
        },
      });
      created++;
    }

    const summary = {
      message: 'Seed completed successfully',
      botsCreated: created,
      skillsTotal: skills.length,
      previousBotsRemoved: botIds.length,
    };

    this.logger.log(JSON.stringify(summary));
    return summary;
  }
}
