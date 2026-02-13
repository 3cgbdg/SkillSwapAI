import { Transform, TransformFnParams } from 'class-transformer';
import { IsString } from 'class-validator';

export class GetSearchDto {
  @IsString()
  @Transform(({ value }: TransformFnParams): string =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  chars: string;
}
