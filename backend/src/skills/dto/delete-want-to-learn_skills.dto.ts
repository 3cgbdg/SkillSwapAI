import { Transform } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class deleteWantToLearnSkillDto {
    @IsString()
    @MinLength(2)
    title: string;
}
