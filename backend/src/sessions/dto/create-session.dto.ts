import { Type } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, Matches, Max, Min, ValidateIf } from "class-validator";
export class CreateSessionDto {
    @IsNotEmpty({ message: 'Empty title' })
    title: string;

    @IsOptional()
    description?: string;

    @IsNotEmpty({ message: 'Date value  is empty' })
    @IsDateString({}, { message: 'Invalid time' })
    date: string;

    @Type(() => Number)
    @IsNotEmpty({ message: 'Start hour range is empty' })
    @Min(0, { message: 'Invalid time' })
    @Max(23, { message: 'Invalid time' })
    start: number;

    @ValidateIf(o =>o.end!==0 && o.start < o.end , { message: 'Invalid time' })

    @Type(() => Number)
    @IsNotEmpty({ message: 'End hour is empty' })
    @Min(0)
    @Max(23)
    end: number;

    @IsNotEmpty({ message: 'Invalid color' })
    @Matches(/^#/)
    color: string;

    @IsNotEmpty({ message: 'Friend ID is empty' })
    friendId: string;
}
