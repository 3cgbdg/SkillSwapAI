import {
  ConflictException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AiService } from 'src/ai/ai.service';
import { JwtPayload, Tokens } from 'types/auth';
import { AuthUtils } from 'src/utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly aiService: AiService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  async signup(dto: CreateAuthDto): Promise<Tokens> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.ensureUserDoesNotExist(dto.name, dto.email);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        password: hashedPassword,
        email: dto.email,
        knownSkills: {
          connectOrCreate: dto.knownSkills.map((title) => ({
            where: { title },
            create: { title },
          })),
        },
        skillsToLearn: {
          connectOrCreate: dto.skillsToLearn.map((title) => ({
            where: { title },
            create: { title },
          })),
        },
      },
    });

    if (!user) throw new InternalServerErrorException('Error creating user');

    void this.aiService.getAiSuggestionSkills(user.id);

    return AuthUtils.generateTokens(user.id, this.jwtService, this.configService);
  }

  private async ensureUserDoesNotExist(name: string, email: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ name }, { email }] },
    });

    if (user) {
      if (user.name === name) throw new ConflictException('Name already exists');
      if (user.email === email) throw new ConflictException('Email already exists');
    }
  }

  loginWithUser(userId: string): Tokens {
    return AuthUtils.generateTokens(userId, this.jwtService, this.configService);
  }

  async login(dto: LoginAuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) throw new NotFoundException('Invalid credentials');

    const isGood = await bcrypt.compare(dto.password, user.password);
    if (!isGood) throw new UnauthorizedException('Invalid credentials');

    return AuthUtils.generateTokens(user.id, this.jwtService, this.configService);
  }

  createAccessToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  async decodeToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.decode(token) as JwtPayload;
    } catch {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
