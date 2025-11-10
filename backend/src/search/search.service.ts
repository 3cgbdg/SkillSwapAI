import { Injectable } from '@nestjs/common';
import { getSearchDto } from './dto/get-search.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { };
  async findAll(dto: getSearchDto, id: string) {
    const skills = await this.prisma.skill.findMany({ where: { title: { contains: dto.chars, mode: 'insensitive' } }, include: { knownBy: { select: { id: true } }, learnedBy: { select: { id: true } } } });
    const users = await this.prisma.user.findMany({ where: { name: { contains: dto.chars, mode: 'insensitive' } }, include: { friendOf: true, friends: true } });
    const newUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      isFriend: user.friends.some(f => f.user2Id == id) ||
        user.friendOf.some(f => f.user2Id == id)
    }))
    const newSkills = skills.filter(skill => !skill.knownBy.some(user => user.id === id) && !skill.learnedBy.some(user => user.id === id))
    return [...newSkills, ...newUsers.filter(user => user.id !== id)];
  }
}
