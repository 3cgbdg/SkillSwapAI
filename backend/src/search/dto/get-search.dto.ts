import { Transform } from "class-transformer";
import { IsString } from "class-validator";

export class getSearchDto {
    @IsString()
    @Transform(({ value }) => typeof value == "string" ? value.toLowerCase() : value)
    chars:string;
}
