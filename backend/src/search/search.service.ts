import { Injectable } from '@nestjs/common';
import { getSearchDto } from './dto/get-search.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { };
  async findAll(dto: getSearchDto) {
    console.log(dto);
    const skills = await this.prisma.skill.findMany({ where: { title: { contains: dto.chars, mode: 'insensitive' } } });
    console.log(skills);
    const users = await this.prisma.user.findMany({ where: { name: { contains: dto.chars, mode: 'insensitive' } } });
    const newUsers = users.map(user => ({
      id: user.id,
      name: user.name
    }))
    return [...skills, ...newUsers];
  }
}
