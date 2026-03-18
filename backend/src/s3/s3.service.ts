import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.getRequiredConfig('AWS_REGION');
    this.bucket = this.getRequiredConfig('AWS_S3_BUCKET_NAME');
    const accessKeyId = this.getRequiredConfig('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.getRequiredConfig('AWS_SECRET_ACCESS_KEY');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new InternalServerErrorException(
        `Missing S3 Configuration: ${key}`,
      );
    }
    return value;
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async deleteFile(url: string | null): Promise<void> {
    if (!url) return;

    const key = this.extractKeyFromUrl(url);
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  private extractKeyFromUrl(url: string): string {
    const key = url.split('.com/')[1];
    if (!key) {
      throw new BadRequestException('Invalid S3 file URL');
    }
    return key;
  }
}
