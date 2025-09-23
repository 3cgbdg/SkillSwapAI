import { Transform, Type } from "class-transformer";
import { IsEmail,  IsNotEmpty, IsOptional, IsString, Matches, matches, MinLength } from "class-validator";

export class CreateAuthDto {
    @IsString()
    @IsNotEmpty()
    name:string;
    @IsEmail()
    @IsNotEmpty()
    @Transform(({value})=>value.trim())
    email:string;
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    password:string;
    confirmPassword:string;
    @IsOptional()
    knownSkills:string[];
    @IsOptional()

    skillsToLearn:string[];
}
