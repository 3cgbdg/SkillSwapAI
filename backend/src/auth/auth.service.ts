import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs'
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService, private readonly configService: ConfigService) { };
  async signup(dto: CreateAuthDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException();
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        password: hashedPassword,
        email: dto.email,
        knownSkills: {
          connectOrCreate: dto.knownSkills.map(title => ({
            where: { title },
            create: { title },
          }))
        },
        skillsToLearn: {
          connectOrCreate: dto.skillsToLearn.map(title => ({
            where: { title },
            create: { title },
          }))
        }
      }
    })
    if (!user) {
      throw new InternalServerErrorException();
    }
    const access_token = this.jwtService.sign({ userId: user.id });
    const refresh_token = this.jwtService.sign({ userId: user.id }, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d'
    },
    );
    return { access_token, refresh_token };
  }

  async login(dto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException();
    }
    const isGood = await bcrypt.compare(dto.password, user.password);
    if (!isGood) throw new InternalServerErrorException();
    const access_token = this.jwtService.sign({ userId: user.id });
    const refresh_token = this.jwtService.sign({ userId: user.id }, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d'
    },
    );

    return { access_token, refresh_token };
  }

  async createTokenForRefresh(user: User) {
    return this.jwtService.sign(
      { userId: user.id }
    );
  }
}
