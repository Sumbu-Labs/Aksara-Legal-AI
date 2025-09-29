import { DocumentVersion } from '../entities/document-version.entity';

export interface DocumentVersionRepository {
  findById(id: string): Promise<DocumentVersion | null>;
  findLatestVersion(documentId: string): Promise<DocumentVersion | null>;
  findVersions(documentId: string): Promise<DocumentVersion[]>;
  save(version: DocumentVersion): Promise<void>;
  delete(version: DocumentVersion): Promise<void>;
}
