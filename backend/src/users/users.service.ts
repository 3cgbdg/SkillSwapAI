import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

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
}