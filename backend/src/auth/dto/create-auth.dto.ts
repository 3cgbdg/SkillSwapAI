import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams): string =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  email: string;
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
  password: string;
  confirmPassword: string;
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  knownSkills: string[];
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skillsToLearn: string[];
}
