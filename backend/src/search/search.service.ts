import { Injectable } from '@nestjs/common';
import { GetSearchDto } from './dto/GetSearchDto';
import { PrismaService } from 'prisma/prisma.service';
import { ReturnDataType } from 'types/general';
import { SearchUtils } from './utils/search.utils';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(
    dto: GetSearchDto,
    myId: string,
  ): Promise<ReturnDataType<any[]>> {
    const [skills, users] = await Promise.all([
      this.prisma.skill.findMany({
        where: { title: { contains: dto.chars, mode: 'insensitive' } },
        include: {
          knownBy: { select: { id: true } },
          learnedBy: { select: { id: true } },
        },
      }),
      this.prisma.user.findMany({
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
      }),
    ]);

    const data = SearchUtils.filterAndMapResults(skills, users, myId);

    return { data };
  }
}
