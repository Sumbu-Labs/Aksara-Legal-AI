import { ApiProperty } from '@nestjs/swagger';
import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';
import { Document } from '../../domain/entities/document.entity';
import { DocumentVersionResponseDto } from './document-version-response.dto';

type Nullable<T> = T | null | undefined;

export class DocumentResponseDto {
  @ApiProperty({ description: 'Document identifier' })
  id: string;

  @ApiProperty({ description: 'Owner user identifier' })
  userId: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Related business profile identifier',
  })
  businessProfileId: Nullable<string>;

  @ApiProperty({ required: false, nullable: true, enum: PermitType })
  permitType: Nullable<PermitType>;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Display label for the document',
  })
  label: Nullable<string>;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Timestamp when document was soft deleted',
  })
  deletedAt: Nullable<Date>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ type: () => DocumentVersionResponseDto, required: false })
  currentVersion: Nullable<DocumentVersionResponseDto>;

  @ApiProperty({ type: () => [DocumentVersionResponseDto] })
  versions: DocumentVersionResponseDto[];

  static fromDomain(
    document: Document,
    downloadUrl?: string,
  ): DocumentResponseDto {
    const currentVersion = document.currentVersion
      ? DocumentVersionResponseDto.fromDomain(
          document.currentVersion,
          downloadUrl,
        )
      : null;
    return {
      id: document.id,
      userId: document.userId,
      businessProfileId: document.businessProfileId,
      permitType: document.permitType ?? null,
      label: document.label,
      deletedAt: document.deletedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      currentVersion,
      versions: document.versions.map((version) =>
        DocumentVersionResponseDto.fromDomain(
          version,
          currentVersion && currentVersion.id === version.id
            ? downloadUrl
            : undefined,
        ),
      ),
    };
  }
}
