import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { ObjectStorageService } from './object-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        const endpoint = configService.get<string>('MINIO_ENDPOINT') ?? 'http://minio:7900';
        const region = configService.get<string>('MINIO_REGION') ?? 'us-east-1';
        const accessKeyId = configService.get<string>('MINIO_ROOT_USER') ?? 'minioadmin';
        const secretAccessKey = configService.get<string>('MINIO_ROOT_PASSWORD') ?? 'minioadmin123';
        const useSSL = (configService.get<string>('MINIO_USE_SSL') ?? 'false').toLowerCase() === 'true';

        const endpointUrl = new URL(endpoint);
        if (useSSL && endpointUrl.protocol !== 'https:') {
          endpointUrl.protocol = 'https:';
        }
        if (!useSSL && endpointUrl.protocol !== 'http:') {
          endpointUrl.protocol = 'http:';
        }

        return new S3Client({
          region,
          endpoint: endpointUrl.toString(),
          forcePathStyle: true,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      },
      inject: [ConfigService],
    },
    ObjectStorageService,
  ],
  exports: [ObjectStorageService],
})
export class StorageModule {}
