import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        include: {
            knownSkills: true,
            skillsToLearn: true,
            friends: true,
            friendOf: true,
            matchesInitiated: true,
            matchesReceived: true,
        },
    });

    console.log(JSON.stringify(users.map(u => ({
        id: u.id,
        name: u.name,
        friends: u.friends,
        friendOf: u.friendOf,
        matchesI: u.matchesInitiated,
        matchesR: u.matchesReceived,
        knownCount: u.knownSkills.length,
        learnCount: u.skillsToLearn.length
    })), null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
