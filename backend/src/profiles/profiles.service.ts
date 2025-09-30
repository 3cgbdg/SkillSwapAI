import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProfilesService {

  constructor(private readonly prisma: PrismaService) { };

  async findOne(id: string) {
    const profile = await this.prisma.user.findFirst({ where: { id: id } });
    if (profile) {
      const { password, ...user } = profile;
      return user;
    }
    return null
  }

}
