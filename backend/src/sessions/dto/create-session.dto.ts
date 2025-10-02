import { Type } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, Matches, Max, Min, ValidateIf } from "class-validator";
export class CreateSessionDto {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    description?: string;

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @Type(() => Number)
    @IsNotEmpty()
    @Min(0)
    @Max(23)
    start: number;

    @ValidateIf(o => o.start < o.end)

    @Type(() => Number)
    @IsNotEmpty()
    @Min(0)
    @Max(23)
    end: number;

    @IsNotEmpty()
    @Matches(/^#/)
    color: string;
}
