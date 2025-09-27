import { Transform } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class GetChatDto {
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    with: string
}
