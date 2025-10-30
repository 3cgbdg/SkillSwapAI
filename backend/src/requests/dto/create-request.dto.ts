import { IsOptional, IsString } from "class-validator";

export class CreateRequestDto {
    @IsString()
    @IsOptional()
    id: string;
    @IsString()
    @IsOptional()
    name: string;
}
