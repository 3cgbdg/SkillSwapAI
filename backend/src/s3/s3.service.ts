import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucket: string;

    constructor(private readonly configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION');
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;
        if(!region || !accessKeyId || !secretAccessKey || !this.bucket){
            throw new InternalServerErrorException("Missing S3 Configuration")
        }
        this.s3Client = new S3Client({
            region: region,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            }
        });
    }

 
    async uploadFile(file: Express.Multer.File, key: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        try {
            await this.s3Client.send(command);
            return { key };
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new InternalServerErrorException('Error uploading file');
        }
    }

}