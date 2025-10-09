
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSessionStatusDto {
    @IsNotEmpty({ message: 'Value must be not empty!' })
    @IsString({ message: 'Value must be string type!' })
    requestId: string;
    @IsNotEmpty({ message: 'Value must be not empty!' })
    @IsString({ message: 'Value must be string type!' })
    friendId: string;
}
