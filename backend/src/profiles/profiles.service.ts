import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {

  constructor(private readonly prisma: PrismaService, private readonly s3Service: S3Service) { };

  async findOne(id: string) {
    const profile = await this.prisma.user.findFirst({ where: { id: id }, include: { skillsToLearn: { select: { title: true } }, knownSkills: { select: { title: true } } } });
    if (profile) {
      const { password, ...user } = profile;
      return user;
    }
    return null
  }

  async uploadImage(file: Express.Multer.File, key: string, myId: string): Promise<{ url: string, message: string }> {
    const url = await this.s3Service.uploadFile(file, key);
    if (url)
      await this.prisma.user.update({ where: { id: myId }, data: { imageUrl: url } });
    return { url, message: "Image is successfully uploaded" };
  }

  async deleteImage(user: User): Promise<{ message: string }> {
    const hasAvatarImage = user.imageUrl ?? null;
    if (!hasAvatarImage) {
      throw new BadRequestException("There`s no avatar-image");
    }
    const key = user.imageUrl?.split(".com/")[1];
    if (key) {
      try {
        await this.s3Service.deleteFile(key);
        await this.prisma.user.update({ where: { id: user.id }, data: { imageUrl: null } })
        return { message: "Successfully deleted!" };
      } catch {
        throw new InternalServerErrorException("Something went wrong");
      }

    } else {
      throw new InternalServerErrorException("Something went wrong");
    }

  }

  async updateProfile(dto: UpdateProfileDto, user: User): Promise<{ message: string }> {
    const dataToUpdate = (Object.keys(dto) as (keyof UpdateProfileDto)[])
      .reduce((acc, key) => {
        const value = dto[key];
        if (value !== undefined && value !== user[key]) {
          acc[key] = value;
        }
        return acc;
      }, {} as Partial<UpdateProfileDto>);
    if (Object.keys(dataToUpdate).length === 0) {
      return { message: "No changes detected" };
    }
    try {
      await this.prisma.user.update({ where: { id: user.id }, data: dataToUpdate });
    } catch {
      throw new InternalServerErrorException("Something went wrong")
    }
    return { message: "Successfully updated!" };
  }
}
