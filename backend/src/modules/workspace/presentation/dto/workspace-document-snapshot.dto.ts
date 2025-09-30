import { ApiProperty } from '@nestjs/swagger';
import { DocumentResponseDto } from '../../../documents/presentation/dto/document-response.dto';

export class WorkspaceDocumentSnapshotDto {
  @ApiProperty({ description: 'Identifier dokumen' })
  id: string;

  @ApiProperty({ required: false, nullable: true, description: 'Label dokumen' })
  label: string | null;

  @ApiProperty({ required: false, nullable: true, description: 'Jenis izin terkait' })
  permitType: string | null;

  @ApiProperty({ required: false, nullable: true, description: 'Nama file terbaru' })
  filename: string | null;

  @ApiProperty({ required: false, nullable: true, description: 'Ukuran file terbaru dalam byte' })
  size: number | null;

  @ApiProperty({ description: 'Timestamp unggah dalam ISO string' })
  uploadedAt: string;

  @ApiProperty({ description: 'Timestamp pembaruan terakhir dalam ISO string' })
  updatedAt: string;

  static fromDocument(document: DocumentResponseDto): WorkspaceDocumentSnapshotDto {
    const currentVersion = document.currentVersion;
    return {
      id: document.id,
      label: document.label ?? null,
      permitType: document.permitType ?? null,
      filename: currentVersion?.originalFilename ?? null,
      size: currentVersion?.size ?? null,
      uploadedAt: WorkspaceDocumentSnapshotDto.toIsoString(document.createdAt),
      updatedAt: WorkspaceDocumentSnapshotDto.toIsoString(document.updatedAt),
    };
  }

  private static toIsoString(value: Date | string | null | undefined): string {
    if (!value) {
      return new Date(0).toISOString();
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
  }
}
