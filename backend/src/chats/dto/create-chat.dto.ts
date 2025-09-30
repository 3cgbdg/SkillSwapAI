import { Transform } from "class-transformer";
import { IsNotEmpty, MinLength } from "class-validator";

export class CreateChatDto {
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    friendId: string

    @IsNotEmpty()
    @MinLength(4)
    friendName: string
}
