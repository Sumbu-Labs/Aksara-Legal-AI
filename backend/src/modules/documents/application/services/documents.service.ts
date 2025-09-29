import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import { ObjectStorageService } from '../../../../infrastructure/storage/object-storage.service';
import { DOCUMENT_REPOSITORY, DOCUMENT_VERSION_REPOSITORY } from '../../common/document.constants';
import { Document } from '../../domain/entities/document.entity';
import { DocumentVersion } from '../../domain/entities/document-version.entity';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentVersionRepository } from '../../domain/repositories/document-version.repository';
import { BatchUploadDocumentCommand, ReplaceDocumentCommand, UploadDocumentCommand } from '../dto/upload-document.command';
import { DocumentQuotaService } from './document-quota.service';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
    @Inject(DOCUMENT_VERSION_REPOSITORY)
    private readonly documentVersionRepository: DocumentVersionRepository,
    private readonly objectStorage: ObjectStorageService,
    private readonly quotaService: DocumentQuotaService,
  ) {}

  async uploadDocument(command: UploadDocumentCommand): Promise<Document> {
    await this.quotaService.ensureCanUpload(command.userId, [command.file]);
    const documentId = randomUUID();
    const versionId = randomUUID();
    const storageKey = this.buildStorageKey(command.userId, documentId, versionId, command.file.originalname);
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

    const created = await this.documentRepository.findByIdForUser(documentId, command.userId);
    if (!created) {
      throw new NotFoundException('Document not found after creation');
    }
    return created;
  }

  async uploadBatch(command: BatchUploadDocumentCommand): Promise<Document[]> {
    await this.quotaService.ensureCanUpload(command.userId, command.documents.map((item) => item.file));

    const results: Document[] = [];
    for (const doc of command.documents) {
      const document = await this.uploadDocument({ ...doc, userId: command.userId });
      results.push(document);
    }
    return results;
  }

  async replaceDocument(command: ReplaceDocumentCommand): Promise<Document> {
    const document = await this.documentRepository.findByIdForUser(command.documentId, command.userId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.quotaService.ensureCanUpload(command.userId, [command.file]);

    const latest = await this.documentVersionRepository.findLatestVersion(command.documentId);
    const nextVersion = (latest?.version ?? 0) + 1;
    const versionId = randomUUID();
    const storageKey = this.buildStorageKey(command.userId, command.documentId, versionId, command.file.originalname);
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

    const refreshed = await this.documentRepository.findByIdForUser(command.documentId, command.userId);
    if (!refreshed) {
      throw new NotFoundException('Document not found after update');
    }
    return refreshed;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.documentRepository.findByIdForUser(documentId, userId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.markDeleted();
    await this.documentRepository.softDelete(document);

    // delete objects from storage (best-effort)
    const versions = await this.documentVersionRepository.findVersions(documentId);
    await Promise.all(
      versions.map((version) => this.objectStorage.deleteObject(version.storageKey).catch(() => undefined)),
    );
  }

  async getDocument(userId: string, documentId: string): Promise<{ document: Document; downloadUrl: string | undefined }> {
    const document = await this.documentRepository.findByIdForUser(documentId, userId);
    if (!document || document.deletedAt) {
      throw new NotFoundException('Document not found');
    }
    const currentVersion = document.currentVersion;
    if (!currentVersion) {
      throw new NotFoundException('Document version not found');
    }
    const downloadUrl = await this.objectStorage.generateDownloadUrl(currentVersion.storageKey);
    return { document, downloadUrl };
  }

  async listDocuments(userId: string): Promise<Document[]> {
    return this.documentRepository.listByUser(userId);
  }

  async ensureOwnership(userId: string, documentId: string): Promise<Document> {
    const document = await this.documentRepository.findByIdForUser(documentId, userId);
    if (!document) {
      throw new UnauthorizedException('Document not accessible');
    }
    if (document.deletedAt) {
      throw new NotFoundException('Document has been deleted');
    }
    return document;
  }

  private buildStorageKey(userId: string, documentId: string, versionId: string, originalName: string): string {
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]+/g, '-').toLowerCase();
    return `documents/${userId}/${documentId}/${versionId}/${safeName}`;
  }

  private computeChecksum(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }
}
