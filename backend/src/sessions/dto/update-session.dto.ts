
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSessionDto {
    @IsNotEmpty({ message: 'Value must be not empty!' })
    @IsString({ message: 'Value must be string type!' })
    sessionId: string;
    @IsNotEmpty({ message: 'Value must be not empty!' })
    @IsString({ message: 'Value must be string type!' })
    requestId: string;
}
