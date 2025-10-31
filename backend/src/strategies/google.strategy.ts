// import { Injectable, NotFoundException } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { PassportStrategy } from "@nestjs/passport";
// import { Strategy, VerifyCallback } from "passport-google-oauth20";
// import { PrismaService } from "prisma/prisma.service";

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//     constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {
//         super({
//             clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
//             clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
//             callbackURL: '/auth/google/callback',
//             scope: ['email', 'profile'],
//         });
//     }

//     async validate(payload: any) {
//         const user = await this.prisma.user.findUnique({ where: { id: payload.userId }, include: { skillsToLearn: true, knownSkills: true } });
//         if (!user)
//             throw new NotFoundException();
//         return user;
//     }

//     async validate(profile: any, done: VerifyCallback): Promise<any> {
//         const { name, emails, photos } = profile;
//         const user = {
//             email: emails[0].value,
//             firstName: name.givenName,
//             lastName: name.familyName,
//             picture: photos[0].value,
//         };
//         done(null, user);
//     }
// }