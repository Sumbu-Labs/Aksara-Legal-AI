import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { DocumentVersion } from '../../domain/entities/document-version.entity';
import { DocumentVersionRepository } from '../../domain/repositories/document-version.repository';
import { DocumentMapper } from '../mappers/document.mapper';

@Injectable()
export class PrismaDocumentVersionRepository
  implements DocumentVersionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DocumentVersion | null> {
    const record = await this.prisma.documentVersion.findUnique({
      where: { id },
    });
    return record ? DocumentMapper.mapVersion(record) : null;
  }

  async findLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    const record = await this.prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });
    return record ? DocumentMapper.mapVersion(record) : null;
  }

  async findVersions(documentId: string): Promise<DocumentVersion[]> {
    const records = await this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'asc' },
    });
    return records.map((record) => DocumentMapper.mapVersion(record));
  }

  async save(version: DocumentVersion): Promise<void> {
    const data = version.toJSON();
    await this.prisma.documentVersion.create({
      data: {
        id: data.id,
        documentId: data.documentId,
        version: data.version,
        storageKey: data.storageKey,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        size: BigInt(data.size),
        checksum: data.checksum,
        notes: data.notes,
        metadata: (data.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        uploadedBy: data.uploadedBy,
        createdAt: data.createdAt,
      },
    });
  }

  async delete(version: DocumentVersion): Promise<void> {
    await this.prisma.documentVersion.delete({ where: { id: version.id } });
  }
}
