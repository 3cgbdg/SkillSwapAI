import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ProfilesService {

  constructor(private readonly prisma: PrismaService, private readonly s3Service: S3Service) { };

  async findOne(id: string) {
    const profile = await this.prisma.user.findFirst({ where: { id: id } });
    if (profile) {
      const { password, ...user } = profile;
      return user;
    }
    return null
  }

  async uploadPhoto(file: Express.Multer.File, key: string, myId: string): Promise<string> {
    const url = await this.s3Service.uploadFile(file, key);
    if (url)
      await this.prisma.user.update({ where: { id: myId }, data: { imageUrl: url } });
    return url;
  }

}
