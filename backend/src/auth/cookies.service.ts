import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AUTH_CONSTANTS } from 'src/constants/auth';

@Injectable()
export class CookiesService {
    constructor(private readonly configService: ConfigService) { }

    private get isProduction(): boolean {
        return this.configService.get<string>('NODE_ENV') === 'production';
    }

    setCookies(res: Response, access_token: string, refresh_token: string): void {
        this.setAccessCookie(res, access_token);
        this.setRefreshCookie(res, refresh_token);
    }

    setAccessCookie(res: Response, access_token: string): void {
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: this.isProduction ? 'none' : 'lax',
            maxAge: AUTH_CONSTANTS.MAX_ACCESS_COOKIE_AGE,
        });
    }

    setRefreshCookie(res: Response, refresh_token: string): void {
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: this.isProduction ? 'none' : 'lax',
            maxAge: AUTH_CONSTANTS.MAX_REFRESH_COOKIE_AGE,
        });
    }

    clearCookies(res: Response): void {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: this.isProduction ? 'none' : 'lax',
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: this.isProduction ? 'none' : 'lax',
        });
    }
}
