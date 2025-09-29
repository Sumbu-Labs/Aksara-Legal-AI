import {
  Document as PrismaDocument,
  DocumentVersion as PrismaDocumentVersion,
  Prisma,
} from '@prisma/client';
import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';
import { Document } from '../../domain/entities/document.entity';
import { DocumentVersion } from '../../domain/entities/document-version.entity';

type DocumentWithRelations = PrismaDocument & {
  currentVersion?: PrismaDocumentVersion | null;
  versions?: PrismaDocumentVersion[];
};

export class DocumentMapper {
  static toDomain(record: DocumentWithRelations): Document {
    const versionRecords = record.versions ?? [];
    const versions = versionRecords.map((version) => this.mapVersion(version));
    let currentVersion: DocumentVersion | null = null;

    if (record.currentVersion) {
      currentVersion = this.mapVersion(record.currentVersion);
    } else if (record.currentVersionId) {
      currentVersion = versions.find((version) => version.id === record.currentVersionId) ?? null;
    }

    return Document.create({
      id: record.id,
      userId: record.userId,
      businessProfileId: record.businessProfileId,
      permitType: record.permitType ? (record.permitType as PermitType) : null,
      label: record.label,
      currentVersion,
      versions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }

  static mapVersion(version: PrismaDocumentVersion): DocumentVersion {
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

  private static parseMetadata(metadata: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
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
}
