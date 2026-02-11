import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Req,
  UseGuards,
  Res,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { GoogleProfile } from 'types/auth';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import type { RequestWithUser, JwtPayload } from 'types/auth';
import type { IReturnMessage, ReturnDataType } from 'types/general';
import { ProfilesService } from 'src/profiles/profiles.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly profilesService: ProfilesService,
  ) { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // triggers google auth redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as GoogleProfile;
    if (!profile) {
      throw new HttpException(
        'Google authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.profilesService.findOrCreateGoogleUser(profile);
    const response = this.authService.loginWithUser(user);

    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      maxAge: 1000 * 60 * 15,
      path: '/',
    });

    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      maxAge: 1000 * 3600 * 24 * 7,
      path: '/',
    });

    const frontendUrl =
      this.configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/dashboard`);
  }

  @Post('signup')
  async signup(
    @Body() createAuthDto: CreateAuthDto,
    @Res() res: Response,
  ): Promise<Response<IReturnMessage>> {
    const response = await this.authService.signup(createAuthDto);

    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',

      maxAge: 1000 * 60 * 15,
      path: '/',
    });
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',

      maxAge: 1000 * 3600 * 24 * 7,
      path: '/',
    });
    return res.json({ message: 'Successfully signed up!' });
  }

  @Post('login')
  async login(
    @Body() LoginAuthDto: LoginAuthDto,
    @Res() res: Response,
  ): Promise<Response<IReturnMessage>> {
    const response = await this.authService.login(LoginAuthDto);
    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',

      maxAge: 1000 * 60 * 15,
      path: '/',
    });
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',

      maxAge: 1000 * 3600 * 24 * 7,
      path: '/',
    });
    return res.json({ message: 'Successfully logged in!' });
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(
    @Req() request: RequestWithUser,
  ): Promise<ReturnDataType<Omit<User, 'password'>>> {
    console.log('[AuthController] Profile request for user:', request.user?.id);
    const user = await this.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { skillsToLearn: true, knownSkills: true },
    });
    if (!user) throw new NotFoundException();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...returnData } = user;
    return { data: returnData };
  }

  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<IReturnMessage>> {
    const refreshToken = (req.cookies as Record<string, string | undefined>)[
      'refresh_token'
    ];
    console.log('[AuthController] Refresh token found in cookies:', !!refreshToken);
    if (!refreshToken) {
      throw new HttpException('No refresh token', HttpStatus.UNAUTHORIZED);
    }
    let payload: JwtPayload;
    try {
      if (!refreshToken) throw new Error();
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      });
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const newAccessToken = this.authService.createTokenForRefresh(user);
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      maxAge: 1000 * 60 * 15,
      path: '/',
    });

    return res.json({ message: 'Access token refreshed' });
  }

  @Delete('logout')
  logout(@Res({ passthrough: true }) res: Response): IReturnMessage {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      path: '/',
    });

    return { message: 'Successfully logged out!' };
  }
}
