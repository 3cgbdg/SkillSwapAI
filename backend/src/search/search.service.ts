import { Injectable } from '@nestjs/common';
import { getSearchDto } from './dto/get-search.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(dto: getSearchDto, myId: string) {
    const skills = await this.prisma.skill.findMany({
      where: { title: { contains: dto.chars, mode: 'insensitive' } },
      include: {
        knownBy: { select: { id: true } },
        learnedBy: { select: { id: true } },
      },
    });
    const users = await this.prisma.user.findMany({
      where: {
        name: { contains: dto.chars, mode: 'insensitive' },
        NOT: {
          OR: [
            { friends: { some: { user2Id: myId } } },
            { friendOf: { some: { user1Id: myId } } },
            { id: myId },
          ],
        },
      },
      include: { friendOf: true, friends: true },
    });

    const newUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
    const newSkills = skills.filter(
      (skill) =>
        !skill.knownBy.some((user) => user.id === myId) &&
        !skill.learnedBy.some((user) => user.id === myId),
    );
    return [...newSkills, ...newUsers];
  }
}
