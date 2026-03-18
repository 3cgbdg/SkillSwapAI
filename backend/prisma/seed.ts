import { PrismaClient, Skill } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Cleaning database...');
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding 50 specific skills...');
  const allSkillTitles = [...TECHNICAL_SKILLS, ...GENERAL_SKILLS];
  const skills: Skill[] = [];

  for (const title of allSkillTitles) {
    const skill = await prisma.skill.create({
      data: { title },
    });
    skills.push(skill);
  }

  console.log('Seeding 50 users...');
  for (let i = 0; i < 50; i++) {
    const knownSkillsCount = faker.number.int({ min: 3, max: 5 });
    const skillsToLearnCount = faker.number.int({ min: 3, max: 5 });

    const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
    const userKnownSkills = shuffledSkills.slice(0, knownSkillsCount);
    const userSkillsToLearn = shuffledSkills.slice(
      knownSkillsCount,
      knownSkillsCount + skillsToLearnCount,
    );

    await prisma.user.create({
      data: {
        isBot: true,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: 'password123',
        bio: faker.lorem.sentence(),
        imageUrl: faker.image.avatar(),
        knownSkills: {
          connect: userKnownSkills.map((s) => ({ id: s.id })),
        },
        skillsToLearn: {
          connect: userSkillsToLearn.map((s) => ({ id: s.id })),
        },
      },
    });
  }

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
