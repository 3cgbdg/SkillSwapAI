import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Res, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService, private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  @Post("signup")
  async signup(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    const response = await this.authService.signup(createAuthDto);
    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',

      maxAge: 1000 * 60 * 15,
    })
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',

      maxAge: 1000 * 3600 * 24 * 7,
    })
    return { message: "Successfully logged in!" }
  }

  @Post("login")
  async login(@Body() LoginAuthDto: LoginAuthDto, @Res() res: Response) {
    const response = await this.authService.login(LoginAuthDto);
    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',

      maxAge: 1000 * 60 * 15,
    })
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',

      maxAge: 1000 * 3600 * 24 * 7,
    })
    return res.json({ message: "Successfully logged in!" });
  }

  @Get("profile")
  @UseGuards(AuthGuard('jwt'))
  async profile(@Req() request: Request) {
    const { password, ...user } = request.user as any;
    return user;
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new HttpException("No refresh token", HttpStatus.UNAUTHORIZED);
    }
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('JWT_REFRESH_SECRET')! });
    } catch (err) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new NotFoundException();
    }
    const newAccessToken = this.authService.createTokenForRefresh(user)
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15,
    });

    return res.json({ message: 'Access token refreshed' });

  }

  @Delete('logout')
  async logout(@Res({ passthrough: true }) res: Response) {


    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: this.configService.get<string>('NODE_ENV') === 'production' ? 'none' : 'lax',
    });

    return { message: 'Successfully logged out!' };

  }
}
