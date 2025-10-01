import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

export interface UploadObjectParams {
  key: string;
  body: Buffer | Readable;
  contentType: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly bucket: string;
  private readonly presignedTtl: number;
  private readonly publicEndpoint?: URL;

  constructor(
    private readonly s3: S3Client,
    configService: ConfigService,
  ) {
    this.bucket =
      configService.get<string>('MINIO_BUCKET_DOCUMENTS') ?? 'documents';
    this.presignedTtl = Number(
      configService.get<string>('MINIO_PRESIGNED_TTL') ?? 900,
    );
    const publicEndpoint = configService.get<string>('MINIO_PUBLIC_ENDPOINT');
    this.publicEndpoint = publicEndpoint ? new URL(publicEndpoint) : undefined;
  }

  async uploadObject(params: UploadObjectParams): Promise<void> {
    try {
      const body =
        params.body instanceof Readable
          ? params.body
          : Readable.from(params.body);
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: params.key,
          Body: body,
          ContentType: params.contentType,
          Metadata: params.metadata,
        },
      });
      await upload.done();
    } catch (error) {
      this.logger.error(
        `Failed to upload object ${params.key}`,
        error as Error,
      );
      throw new InternalServerErrorException('Failed to upload document');
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete object ${key}`, error as Error);
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async generateDownloadUrl(
    key: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const ttl = expiresInSeconds ?? this.presignedTtl;
    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: ttl });
    if (!this.publicEndpoint) {
      return signedUrl;
    }

    const url = new URL(signedUrl);
    url.protocol = this.publicEndpoint.protocol;
    url.host = this.publicEndpoint.host;
    if (this.publicEndpoint.port) {
      url.port = this.publicEndpoint.port;
    }
    return url.toString();
  }
}
