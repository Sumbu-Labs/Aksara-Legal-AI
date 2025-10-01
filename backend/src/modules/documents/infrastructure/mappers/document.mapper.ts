import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';
import { Document } from '../../domain/entities/document.entity';
import { DocumentVersion } from '../../domain/entities/document-version.entity';

type DocumentRecord = {
  id: string;
  userId: string;
  businessProfileId: string | null;
  permitType: string | null;
  label: string | null;
  currentVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type DocumentVersionRecord = {
  id: string;
  documentId: string;
  version: number;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  size: bigint | number;
  checksum: string | null;
  notes: string | null;
  metadata: unknown;
  uploadedBy: string | null;
  createdAt: Date;
};

type DocumentWithRelations = DocumentRecord & {
  currentVersion?: DocumentVersionRecord | null;
  versions?: DocumentVersionRecord[];
};

export class DocumentMapper {
  static toDomain(record: DocumentWithRelations): Document {
    const versionRecords = record.versions ?? [];
    const versions = versionRecords.map((version) => this.mapVersion(version));
    let currentVersion: DocumentVersion | null = null;

    if (record.currentVersion) {
      currentVersion = this.mapVersion(record.currentVersion);
    } else if (record.currentVersionId) {
      currentVersion =
        versions.find((version) => version.id === record.currentVersionId) ??
        null;
    }

    return Document.create({
      id: record.id,
      userId: record.userId,
      businessProfileId: record.businessProfileId,
      permitType: this.mapPermitType(record.permitType),
      label: record.label,
      currentVersion,
      versions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }

  static mapVersion(version: DocumentVersionRecord): DocumentVersion {
    return DocumentVersion.create({
      id: version.id,
      documentId: version.documentId,
      version: version.version,
      storageKey: version.storageKey,
      originalFilename: version.originalFilename,
      mimeType: version.mimeType,
      size: Number(version.size),
      checksum: version.checksum,
      notes: version.notes,
      metadata: this.parseMetadata(version.metadata),
      uploadedBy: version.uploadedBy,
      createdAt: version.createdAt,
    });
  }

  private static parseMetadata(
    metadata: unknown,
  ): Record<string, unknown> | null {
    if (metadata === null || metadata === undefined) {
      return null;
    }
    if (Array.isArray(metadata)) {
      return { items: metadata as unknown[] };
    }
    if (typeof metadata === 'object') {
      return metadata as Record<string, unknown>;
    }
    return { value: metadata as unknown };
  }

  private static mapPermitType(
    permitType: string | null,
  ): PermitType | null {
    if (permitType === null) {
      return null;
    }

    if (!Object.values(PermitType).includes(permitType as PermitType)) {
      throw new Error(`Unexpected permit type received from database: ${permitType}`);
    }

    return permitType as PermitType;
  }
}
