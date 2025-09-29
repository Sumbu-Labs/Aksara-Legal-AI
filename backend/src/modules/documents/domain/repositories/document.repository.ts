import { Document } from '../entities/document.entity';

export interface DocumentRepository {
  findById(id: string): Promise<Document | null>;
  findByIdForUser(id: string, userId: string): Promise<Document | null>;
  listByUser(userId: string): Promise<Document[]>;
  save(document: Document): Promise<void>;
  update(document: Document): Promise<void>;
  softDelete(document: Document): Promise<void>;
}
