import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class AuthUtils {
    static generateTokens(
        userId: string,
        jwtService: JwtService,
        configService: ConfigService,
    ): { access_token: string; refresh_token: string } {
        const access_token = jwtService.sign({ userId });
        const refresh_token = jwtService.sign(
            { userId },
            {
                secret: configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            },
        );

        return { access_token, refresh_token };
    }
}
