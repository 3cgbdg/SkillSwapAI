import { IsNotEmpty, IsString } from "class-validator";

export class CreateFriendDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}
