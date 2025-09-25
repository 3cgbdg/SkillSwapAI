import { Transform } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class deleteKnownSkillDto {
    @IsString()
    @MinLength(2)
    title: string;
}
