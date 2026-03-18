import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { IReturnMessage, ReturnDataType } from 'types/general';
import { AiService } from 'src/ai/ai.service';
import { GoogleProfile } from 'types/auth';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
  ) {}

  async findOne(id: string): Promise<ReturnDataType<Partial<User> | null>> {
    const profile = await this.prisma.user.findUnique({
      where: { id },
      include: {
        skillsToLearn: { select: { title: true } },
        knownSkills: { select: { title: true } },
      },
    });

    if (!profile) {
      return { data: null };
    }

    const { password, ...userWithoutPassword } = profile;
    return { data: userWithoutPassword };
  }

  async updateProfileAvatarImage(
    file: Express.Multer.File,
    myId: string,
  ): Promise<ReturnDataType<{ url: string }>> {
    const key = `avatars/${Date.now()}_${file.originalname}`;
    const url = await this.s3Service.uploadFile(file, key);
    await this.usersService.updateUserImageUrl(myId, url);
    return { data: { url }, message: 'Image is successfully uploaded' };
  }

  async deleteProfileAvatarImage(user: User): Promise<IReturnMessage> {
    try {
      await this.s3Service.deleteFile(user.imageUrl);
      await this.usersService.updateUserImageUrl(user.id, null);
      return { message: 'Successfully deleted!' };
    } catch {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async updateProfile(
    dto: UpdateProfileDto,
    user: User,
  ): Promise<IReturnMessage> {
    const dataToUpdate = this.getChangedFields(dto, user);

    if (Object.keys(dataToUpdate).length === 0) {
      return { message: 'No changes detected' };
    }

    await this.usersService.update(user.id, dataToUpdate);

    return { message: 'Successfully updated!' };
  }

  private getChangedFields<T extends object>(
    dto: Partial<T>,
    currentData: T,
  ): Partial<T> {
    const acc: Partial<T> = {};
    (Object.keys(dto) as (keyof T)[]).forEach((key) => {
      const value = dto[key];
      if (value !== undefined && value !== currentData[key]) {
        acc[key] = value;
      }
    });
    return acc;
  }

  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<string> {
    const { emails } = profile;
    if (!emails || emails.length === 0) {
      throw new InternalServerErrorException(
        'Google profile must include an email',
      );
    }

    const userId = await this.usersService.findOrCreateGoogleUser(profile);

    // generate ai suggestions for the new user
    void this.aiService.getAiSuggestionSkills(userId);

    return userId;
  }
}
