import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User, Skill } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { GoogleProfile } from 'types/auth';

type UserWithSkills = Omit<User, 'password'> & {
  knownSkills: Skill[];
  skillsToLearn: Skill[];
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findUniqueUserWithSkills(id: string): Promise<UserWithSkills> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { skillsToLearn: true, knownSkills: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserImageUrl(id: string, imageUrl: string | null): Promise<User> {
    return this.update(id, { imageUrl });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<string> {
    const { id: googleId, emails, name, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new BadRequestException('No email found in Google profile');
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      select: { id: true, googleId: true, name: true },
    });

    if (user) {
      return this.handleExistingUser(user, profile);
    }

    const newUser = await this.create({
      googleId,
      email,
      name: this.formatName(name, googleId),
      imageUrl: photos?.[0]?.value,
    });

    return newUser.id;
  }

  private async handleExistingUser(
    user: { id: string; googleId: string | null; name: string | null },
    profile: GoogleProfile,
  ): Promise<string> {
    if (!user.googleId) {
      await this.update(user.id, {
        googleId: profile.id,
        name: this.formatName(profile.name, profile.id) || user.name,
        imageUrl: profile.photos?.[0]?.value,
      });
    }
    return user.id;
  }

  private formatName(name: GoogleProfile['name'], googleId: string): string {
    if (name?.givenName && name?.familyName) {
      return `${name.givenName} ${name.familyName}`;
    }
    return `User ${googleId.slice(0, 5)}`;
  }
}
