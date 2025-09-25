import { IsString } from "class-validator";

export class CreateRequestDto {
    @IsString()
    id:string;
}
