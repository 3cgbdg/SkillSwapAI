import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    bio: string

    @IsOptional()
    @IsString()
    @IsEmail()
    email: string
}
