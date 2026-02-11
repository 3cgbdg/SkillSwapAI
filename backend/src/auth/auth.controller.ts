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
import { CookiesService } from './cookies.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly profilesService: ProfilesService,
    private readonly cookiesService: CookiesService,
    private readonly usersService: UsersService,
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

    this.cookiesService.setCookies(res, response.access_token, response.refresh_token);

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
    this.cookiesService.setCookies(res, response.access_token, response.refresh_token);
    return res.json({ message: 'Successfully signed up!' });
  }

  @Post('login')
  async login(
    @Body() LoginAuthDto: LoginAuthDto,
    @Res() res: Response,
  ): Promise<Response<IReturnMessage>> {
    const response = await this.authService.login(LoginAuthDto);
    this.cookiesService.setCookies(res, response.access_token, response.refresh_token);
    return res.json({ message: 'Successfully logged in!' });
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(
    @Req() request: RequestWithUser,
  ): Promise<ReturnDataType<Omit<User, 'password'>>> {
    const data = await this.usersService.findUniqueUserWithSkills(request.user.id);
    return { data };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response<IReturnMessage>> {
    const refreshToken = (req.cookies as Record<string, string | undefined>)[
      'refresh_token'
    ];
    console.log('[AuthController] Refresh token found in cookies:', !!refreshToken);
    if (!refreshToken) {
      throw new HttpException('No refresh token', HttpStatus.UNAUTHORIZED);
    }
    const payload: JwtPayload = await this.authService.decodeRefreshToken(refreshToken);

    const newAccessToken = this.authService.createTokenForAccessToken(payload.userId);
    this.cookiesService.setCookies(res, newAccessToken, refreshToken);

    return res.json({ message: 'Access token refreshed' });
  }

  @Delete('logout')
  logout(@Res({ passthrough: true }) res: Response): IReturnMessage {
    this.cookiesService.clearCookies(res);
    return { message: 'Successfully logged out!' };
  }
}
