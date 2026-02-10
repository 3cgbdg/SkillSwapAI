import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { IReturnMessage, ReturnDataType } from 'types/general';
import { AiService } from 'src/ai/ai.service';
import { GoogleProfile } from 'types/auth';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly aiService: AiService,
  ) {}

  async findOne(id: string): Promise<ReturnDataType<any>> {
    const profile = await this.prisma.user.findFirst({
      where: { id: id },
      include: {
        skillsToLearn: { select: { title: true } },
        knownSkills: { select: { title: true } },
      },
    });
    if (!profile) return { data: null };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = profile;
    return { data: user };
  }

  async uploadImage(
    file: Express.Multer.File,
    key: string,
    myId: string,
  ): Promise<ReturnDataType<{ url: string }>> {
    const url = await this.s3Service.uploadFile(file, key);
    if (url)
      await this.prisma.user.update({
        where: { id: myId },
        data: { imageUrl: url },
      });
    return { data: { url }, message: 'Image is successfully uploaded' };
  }

  async deleteImage(user: User): Promise<IReturnMessage> {
    const hasAvatarImage = user.imageUrl ?? null;
    if (!hasAvatarImage) {
      throw new BadRequestException('There`s no avatar-image');
    }
    const key = user.imageUrl?.split('.com/')[1];
    if (key) {
      try {
        await this.s3Service.deleteFile(key);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { imageUrl: null },
        });
        return { message: 'Successfully deleted!' };
      } catch {
        throw new InternalServerErrorException('Something went wrong');
      }
    } else {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async updateProfile(
    dto: UpdateProfileDto,
    user: User,
  ): Promise<IReturnMessage> {
    const dataToUpdate = (
      Object.keys(dto) as (keyof UpdateProfileDto)[]
    ).reduce((acc, key) => {
      const value = dto[key];
      if (value !== undefined && value !== user[key]) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<UpdateProfileDto>);
    if (Object.keys(dataToUpdate).length === 0) {
      return { message: 'No changes detected' };
    }
    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate,
      });
    } catch {
      throw new InternalServerErrorException('Something went wrong');
    }
    return { message: 'Successfully updated!' };
  }

  async getPollingDataAiSuggestions(
    id: string,
  ): Promise<ReturnDataType<string[] | null>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return { data: user?.aiSuggestionSkills ?? null };
  }

  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
    const { id, emails, name, photos } = profile;
    if (!emails || emails.length === 0) {
      throw new InternalServerErrorException(
        'Google profile must include an email',
      );
    }
    const email = emails[0].value;

    let user = await this.prisma.user.findFirst({
      where: { googleId: id },
    });

    if (user) {
      if (!user.googleId) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: id,
            name: name ? `${name.givenName} ${name.familyName}` : user.name,
            imageUrl: photos?.[0]?.value,
          },
        });
      }
      return user;
    }

    user = await this.prisma.user.create({
      data: {
        googleId: id,
        email,
        name: name
          ? `${name.givenName} ${name.familyName}`
          : `User ${id.slice(0, 5)}`,
        imageUrl: photos?.[0]?.value,
      },
    });

    // generate ai suggestions for the new user
    void this.aiService.getAiSuggestionSkills(user.id);

    return user;
  }
}
