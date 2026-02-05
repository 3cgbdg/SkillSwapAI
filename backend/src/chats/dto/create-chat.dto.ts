import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams): string =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  friendId: string;
  @IsNotEmpty()
  @MinLength(4)
  friendName: string;
}
