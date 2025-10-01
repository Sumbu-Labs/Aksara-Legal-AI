import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PermitType } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../../database/prisma.service';
import { Document } from '../../domain/entities/document.entity';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentMapper } from '../mappers/document.mapper';

@Injectable()
export class PrismaDocumentRepository implements DocumentRepository {
  private readonly logger = new Logger(PrismaDocumentRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Document | null> {
    const record = await this.prisma.document.findUnique({
      where: { id },
      include: this.withRelations(),
    });

    return record ? DocumentMapper.toDomain(record) : null;
  }

  async findByIdForUser(id: string, userId: string): Promise<Document | null> {
    const record = await this.prisma.document.findFirst({
      where: { id, userId, deletedAt: null },
      include: this.withRelations(),
    });

    return record ? DocumentMapper.toDomain(record) : null;
  }

  async listByUser(userId: string): Promise<Document[]> {
    try {
      const records = await this.prisma.document.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: this.withRelations(),
      });

      return records.map((record) => DocumentMapper.toDomain(record));
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'Document table is missing. Returning empty list for workspace summary.',
        );
        return [];
      }
      throw error;
    }
  }

  async save(document: Document): Promise<void> {
    const data = document.toJSON();
    const versions = data.versions;
    const currentVersionId = data.currentVersion?.id ?? versions.at(-1)?.id ?? null;

    await this.prisma.$transaction(async (tx) => {
      await tx.document.create({
        data: {
          id: data.id,
          userId: data.userId,
          businessProfileId: data.businessProfileId,
          permitType: data.permitType as PermitType | null,
          label: data.label,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          deletedAt: data.deletedAt,
        },
      });

      if (versions.length > 0) {
        await tx.documentVersion.createMany({
          data: versions.map((version) => ({
            id: version.id,
            documentId: data.id,
            version: version.version,
            storageKey: version.storageKey,
            originalFilename: version.originalFilename,
            mimeType: version.mimeType,
            size: BigInt(version.size),
            checksum: version.checksum,
            notes: version.notes,
            metadata: (version.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
            uploadedBy: version.uploadedBy,
            createdAt: version.createdAt,
          })),
        });
      }

      if (currentVersionId) {
        await tx.document.update({
          where: { id: data.id },
          data: { currentVersionId },
        });
      }
    });
  }

  async update(document: Document): Promise<void> {
    const data = document.toJSON();
    await this.prisma.document.update({
      where: { id: data.id },
      data: {
        businessProfileId: data.businessProfileId,
        permitType: data.permitType as PermitType | null,
        label: data.label,
        currentVersionId: data.currentVersion?.id ?? null,
        updatedAt: data.updatedAt,
        deletedAt: data.deletedAt,
      },
    });
  }

  async softDelete(document: Document): Promise<void> {
    await this.prisma.document.update({
      where: { id: document.id },
      data: {
        deletedAt: document.deletedAt ?? new Date(),
      },
    });
  }

  private withRelations(): Prisma.DocumentInclude {
    return {
      currentVersion: true,
      versions: {
        orderBy: { version: 'asc' },
      },
    };
  }

  private isMissingTableError(error: unknown): boolean {
    return (
      error instanceof PrismaClientKnownRequestError && error.code === 'P2021'
    );
  }
}
