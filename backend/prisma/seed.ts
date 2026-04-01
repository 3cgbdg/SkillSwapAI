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

const BOT_COUNT = 150;

const BOT_BIOS = [
  'Passionate learner always looking to swap skills and grow together.',
  'Tech enthusiast by day, creative thinker by night.',
  'Love teaching what I know and learning what I don\'t!',
  'Believe in the power of peer-to-peer learning.',
  'On a mission to master 10 skills before I turn 30.',
  'Jack of many trades, looking to become master of a few.',
  'Life-long learner with a knack for making things click.',
  'Here to connect, collaborate, and grow.',
  'Curious mind with a love for sharing knowledge.',
  'Looking for study buddies and skill-swap partners!',
  'Always up for a challenge and a new skill.',
  'Let\'s learn something awesome together!',
  'Ready to teach, eager to learn.',
  'Building skills one swap at a time.',
  'Knowledge is best when shared.',
];

async function main() {
  console.log('🧹 Cleaning database...');
  await prisma.resource.deleteMany();
  await prisma.module.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.match.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.request.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();

  console.log('🔧 Seeding skills...');
  const allSkillTitles = [
    ...TECHNICAL_SKILLS,
    ...GENERAL_SKILLS,
    ...CREATIVE_SKILLS,
    ...LANGUAGE_SKILLS,
    ...FITNESS_SKILLS,
    ...BUSINESS_SKILLS,
  ];

  // Deduplicate
  const uniqueSkillTitles = [...new Set(allSkillTitles)];
  console.log(`   → ${uniqueSkillTitles.length} unique skills to create`);

  const skills: Skill[] = [];
  for (const title of uniqueSkillTitles) {
    const skill = await prisma.skill.create({
      data: { title },
    });
    skills.push(skill);
  }

  console.log(`🤖 Seeding ${BOT_COUNT} bot users...`);
  const usedNames = new Set<string>();
  const usedEmails = new Set<string>();

  for (let i = 0; i < BOT_COUNT; i++) {
    // Generate unique name
    let name: string;
    do {
      name = faker.person.fullName();
    } while (usedNames.has(name));
    usedNames.add(name);

    // Generate unique email
    let email: string;
    do {
      email = faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] || `bot${i}` });
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const knownSkillsCount = faker.number.int({ min: 3, max: 7 });
    const skillsToLearnCount = faker.number.int({ min: 3, max: 7 });

    const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
    const userKnownSkills = shuffledSkills.slice(0, knownSkillsCount);
    const userSkillsToLearn = shuffledSkills.slice(
      knownSkillsCount,
      knownSkillsCount + skillsToLearnCount,
    );

    const bio = BOT_BIOS[faker.number.int({ min: 0, max: BOT_BIOS.length - 1 })];

    await prisma.user.create({
      data: {
        isBot: true,
        email,
        name,
        password: 'bot_account_no_login',
        bio,
        imageUrl: faker.image.avatar(),
        knownSkills: {
          connect: userKnownSkills.map((s) => ({ id: s.id })),
        },
        skillsToLearn: {
          connect: userSkillsToLearn.map((s) => ({ id: s.id })),
        },
      },
    });

    if ((i + 1) % 25 === 0) {
      console.log(`   → Created ${i + 1}/${BOT_COUNT} bots`);
    }
  }

  console.log('✅ Seeding finished!');
  console.log(`   → ${uniqueSkillTitles.length} skills`);
  console.log(`   → ${BOT_COUNT} bot users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
