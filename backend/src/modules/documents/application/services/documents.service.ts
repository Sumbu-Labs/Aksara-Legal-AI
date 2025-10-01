import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import { ObjectStorageService } from '../../../../infrastructure/storage/object-storage.service';
import {
  DOCUMENT_REPOSITORY,
  DOCUMENT_VERSION_REPOSITORY,
} from '../../common/document.constants';
import { Document } from '../../domain/entities/document.entity';
import { DocumentVersion } from '../../domain/entities/document-version.entity';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentVersionRepository } from '../../domain/repositories/document-version.repository';
import {
  BatchUploadDocumentCommand,
  ReplaceDocumentCommand,
  UploadDocumentCommand,
} from '../dto/upload-document.command';
import { DocumentQuotaService } from './document-quota.service';
import { NotificationsService } from '../../../notifications/application/services/notifications.service';
import { NotificationType } from '../../../notifications/domain/enums/notification-type.enum';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
    @Inject(DOCUMENT_VERSION_REPOSITORY)
    private readonly documentVersionRepository: DocumentVersionRepository,
    private readonly objectStorage: ObjectStorageService,
    private readonly quotaService: DocumentQuotaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async uploadDocument(
    command: UploadDocumentCommand,
    options: { skipQuota?: boolean } = {},
  ): Promise<Document> {
    if (!options.skipQuota) {
      await this.quotaService.ensureCanUpload(command.userId, [command.file], {
        additionalDocuments: 1,
      });
    }
    const documentId = randomUUID();
    const versionId = randomUUID();
    const storageKey = this.buildStorageKey(
      command.userId,
      documentId,
      versionId,
      command.file.originalname,
    );
    const checksum = this.computeChecksum(command.file.buffer);

    await this.objectStorage.uploadObject({
      key: storageKey,
      body: command.file.buffer,
      contentType: command.file.mimetype,
    });

    const document = Document.create({
      id: documentId,
      userId: command.userId,
      businessProfileId: command.businessProfileId ?? null,
      permitType: command.permitType ?? null,
      label: command.label ?? command.file.originalname,
      versions: [],
    });

    const version = DocumentVersion.create({
      id: versionId,
      documentId,
      version: 1,
      storageKey,
      originalFilename: command.file.originalname,
      mimeType: command.file.mimetype,
      size: command.file.size,
      checksum,
      notes: command.notes ?? null,
      metadata: command.metadata ?? null,
      uploadedBy: command.userId,
    });

    document.addVersion(version, true);

    try {
      await this.documentRepository.save(document);
    } catch (error) {
      await this.objectStorage.deleteObject(storageKey).catch(() => undefined);
      throw error;
    }

    const created = await this.documentRepository.findByIdForUser(
      documentId,
      command.userId,
    );
    if (!created) {
      throw new NotFoundException('Document not found after creation');
    }

    await this.safeNotify(command.userId, {
      type: NotificationType.DOCUMENT_UPLOADED,
      title: 'Dokumen berhasil diunggah',
      message: `Dokumen "${command.label ?? command.file.originalname}" berhasil ditambahkan.`,
      payload: {
        documentId: created.id,
        filename: command.file.originalname,
      },
      sendEmail: true,
    });

    return created;
  }

  async uploadBatch(command: BatchUploadDocumentCommand): Promise<Document[]> {
    const files = command.documents.map((item) => item.file);
    await this.quotaService.ensureCanUpload(command.userId, files, {
      additionalDocuments: files.length,
    });

    const results: Document[] = [];
    for (const doc of command.documents) {
      const document = await this.uploadDocument(
        { ...doc, userId: command.userId },
        { skipQuota: true },
      );
      results.push(document);
    }
    return results;
  }

  async replaceDocument(command: ReplaceDocumentCommand): Promise<Document> {
    const document = await this.documentRepository.findByIdForUser(
      command.documentId,
      command.userId,
    );
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.quotaService.ensureCanUpload(command.userId, [command.file], {
      additionalDocuments: 0,
    });

    const latest = await this.documentVersionRepository.findLatestVersion(
      command.documentId,
    );
    const nextVersion = (latest?.version ?? 0) + 1;
    const versionId = randomUUID();
    const storageKey = this.buildStorageKey(
      command.userId,
      command.documentId,
      versionId,
      command.file.originalname,
    );
    const checksum = this.computeChecksum(command.file.buffer);

    await this.objectStorage.uploadObject({
      key: storageKey,
      body: command.file.buffer,
      contentType: command.file.mimetype,
    });

    const version = DocumentVersion.create({
      id: versionId,
      documentId: command.documentId,
      version: nextVersion,
      storageKey,
      originalFilename: command.file.originalname,
      mimeType: command.file.mimetype,
      size: command.file.size,
      checksum,
      notes: command.notes ?? null,
      metadata: command.metadata ?? null,
      uploadedBy: command.userId,
    });

    document.addVersion(version, true);
    if (command.label !== undefined) {
      document.updateLabel(command.label);
    }
    if (command.permitType !== undefined) {
      document.assignPermitType(command.permitType);
    }
    if (command.businessProfileId !== undefined) {
      document.assignBusinessProfile(command.businessProfileId);
    }

    try {
      await this.documentVersionRepository.save(version);
      await this.documentRepository.update(document);
    } catch (error) {
      await this.objectStorage.deleteObject(storageKey).catch(() => undefined);
      throw error;
    }

    const refreshed = await this.documentRepository.findByIdForUser(
      command.documentId,
      command.userId,
    );
    if (!refreshed) {
      throw new NotFoundException('Document not found after update');
    }

    await this.safeNotify(command.userId, {
      type: NotificationType.DOCUMENT_REPLACED,
      title: 'Dokumen diperbarui',
      message: `Dokumen "${command.label ?? command.file.originalname}" telah diperbarui ke versi terbaru.`,
      payload: {
        documentId: refreshed.id,
        version: refreshed.currentVersion?.version,
      },
      sendEmail: false,
    });

    return refreshed;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.documentRepository.findByIdForUser(
      documentId,
      userId,
    );
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const versions =
      await this.documentVersionRepository.findVersions(documentId);
    try {
      for (const version of versions) {
        await this.objectStorage.deleteObject(version.storageKey);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete storage objects for document ${documentId}`,
        error as Error,
      );
      throw new InternalServerErrorException('Failed to delete document files');
    }

    document.markDeleted();
    await this.documentRepository.softDelete(document);
  }

  async getDocument(
    userId: string,
    documentId: string,
  ): Promise<{ document: Document; downloadUrl: string | undefined }> {
    const document = await this.documentRepository.findByIdForUser(
      documentId,
      userId,
    );
    if (!document || document.deletedAt) {
      throw new NotFoundException('Document not found');
    }
    const currentVersion = document.currentVersion;
    if (!currentVersion) {
      throw new NotFoundException('Document version not found');
    }
    const downloadUrl = await this.objectStorage.generateDownloadUrl(
      currentVersion.storageKey,
    );
    return { document, downloadUrl };
  }

  async listDocuments(userId: string): Promise<Document[]> {
    return this.documentRepository.listByUser(userId);
  }

  async ensureOwnership(userId: string, documentId: string): Promise<Document> {
    const document = await this.documentRepository.findByIdForUser(
      documentId,
      userId,
    );
    if (!document) {
      throw new UnauthorizedException('Document not accessible');
    }
    if (document.deletedAt) {
      throw new NotFoundException('Document has been deleted');
    }
    return document;
  }

  private buildStorageKey(
    userId: string,
    documentId: string,
    versionId: string,
    originalName: string,
  ): string {
    const safeName = originalName
      .replace(/[^a-zA-Z0-9_.-]+/g, '-')
      .toLowerCase();
    return `documents/${userId}/${documentId}/${versionId}/${safeName}`;
  }

  private computeChecksum(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private async safeNotify(
    userId: string,
    options: {
      type: NotificationType;
      title: string;
      message: string;
      payload?: Record<string, unknown> | null;
      sendEmail?: boolean;
      emailActionUrl?: string;
    },
  ): Promise<void> {
    try {
      await this.notificationsService.createNotification({
        userId,
        type: options.type,
        title: options.title,
        message: options.message,
        payload: options.payload,
        sendEmail: options.sendEmail,
        emailActionUrl: options.emailActionUrl,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue notification for user ${userId}: ${(error as Error).message}`,
      );
    }
  }
}
