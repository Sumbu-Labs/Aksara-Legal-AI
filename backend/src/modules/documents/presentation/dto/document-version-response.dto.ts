import { ApiProperty } from '@nestjs/swagger';
import { DocumentVersion } from '../../domain/entities/document-version.entity';

type Nullable<T> = T | null | undefined;

export class DocumentVersionResponseDto {
  @ApiProperty({ description: 'Version identifier' })
  id: string;

  @ApiProperty({ description: 'Sequential version number' })
  version: number;

  @ApiProperty({ description: 'Original filename as uploaded' })
  originalFilename: string;

  @ApiProperty({ description: 'MIME type of the file' })
  mimeType: string;

  @ApiProperty({ description: 'Size in bytes' })
  size: number;

  @ApiProperty({ required: false, nullable: true })
  checksum: Nullable<string>;

  @ApiProperty({ required: false, nullable: true })
  notes: Nullable<string>;

  @ApiProperty({
    required: false,
    nullable: true,
    type: Object,
    additionalProperties: true,
  })
  metadata: Nullable<Record<string, unknown>>;

  @ApiProperty({ required: false, nullable: true })
  uploadedBy: Nullable<string>;

  @ApiProperty({ description: 'Timestamp when the version was stored' })
  createdAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Short-lived download URL',
  })
  downloadUrl?: string;

  static fromDomain(
    version: DocumentVersion,
    downloadUrl?: string,
  ): DocumentVersionResponseDto {
    return {
      id: version.id,
      version: version.version,
      originalFilename: version.originalFilename,
      mimeType: version.mimeType,
      size: version.size,
      checksum: version.checksum,
      notes: version.notes,
      metadata: version.metadata,
      uploadedBy: version.uploadedBy,
      createdAt: version.createdAt,
      downloadUrl,
    };
  }
}
