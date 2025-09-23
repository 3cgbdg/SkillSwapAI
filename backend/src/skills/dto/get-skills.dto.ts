import { Transform } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class getSkillsDto {
    @IsString()
    @MinLength(2)
    @Transform(({ value }) => typeof value === "string" ? value.toLowerCase() : value)
    chars: string;
}
