import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class GetSkillsDto {
  @IsString()
  @MinLength(2)
  @Transform(({ value }: TransformFnParams): string =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  chars: string;
}
