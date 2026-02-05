import { IsString, MinLength } from 'class-validator';

export class SkillDto {
  @IsString()
  @MinLength(2)
  title: string;
}
