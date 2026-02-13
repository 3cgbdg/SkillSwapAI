import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { GoogleProfile } from "types/auth";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        try {
            return await this.prisma.user.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            throw error;
        }
    }

    async findUniqueUserWithSkills(id: string): Promise<User & { knownSkills: any[]; skillsToLearn: any[] }> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { skillsToLearn: true, knownSkills: true },
        });
        if (!user) throw new NotFoundException("User not found");

        // Remove password from the returned object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as any;
    }

    async updateUserImageUrl(id: string, imageUrl: string | null): Promise<User> {
        return this.update(id, { imageUrl });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findOrCreateGoogleUser(profile: GoogleProfile): Promise<string> {
        const { id, emails, name, photos } = profile;
        if (!emails || emails.length === 0) {
            throw new Error('No email found in Google profile');
        }
        const email = emails[0].value;

        const existingUser = await this.prisma.user.findFirst({
            where: { googleId: id },
            select: { id: true, googleId: true, name: true }
        });

        if (existingUser) {
            if (!existingUser.googleId) {
                await this.update(existingUser.id, {
                    googleId: id,
                    name: name ? `${name.givenName} ${name.familyName}` : existingUser.name,
                    imageUrl: photos?.[0]?.value,
                });
            }
            return existingUser.id;
        }

        const newUser = await this.create({
            googleId: id,
            email,
            name: name
                ? `${name.givenName} ${name.familyName}`
                : `User ${id.slice(0, 5)}`,
            imageUrl: photos?.[0]?.value,
        });

        return newUser.id;
    }
}