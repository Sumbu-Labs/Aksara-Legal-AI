import { randomUUID } from 'crypto';

export interface DocumentVersionProps {
  id: string;
  documentId: string;
  version: number;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  checksum?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  uploadedBy?: string | null;
  createdAt: Date;
}

export interface CreateDocumentVersionParams {
  id?: string;
  documentId: string;
  version: number;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  checksum?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  uploadedBy?: string | null;
  createdAt?: Date;
}

export class DocumentVersion {
  private constructor(private props: DocumentVersionProps) {}

  static create(params: CreateDocumentVersionParams): DocumentVersion {
    const createdAt = params.createdAt ?? new Date();
    return new DocumentVersion({
      id: params.id ?? randomUUID(),
      documentId: params.documentId,
      version: params.version,
      storageKey: params.storageKey,
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      size: params.size,
      checksum: params.checksum ?? null,
      notes: params.notes ?? null,
      metadata: params.metadata ?? null,
      uploadedBy: params.uploadedBy ?? null,
      createdAt,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get documentId(): string {
    return this.props.documentId;
  }

  get version(): number {
    return this.props.version;
  }

  get storageKey(): string {
    return this.props.storageKey;
  }

  get originalFilename(): string {
    return this.props.originalFilename;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get size(): number {
    return this.props.size;
  }

  get checksum(): string | null {
    return this.props.checksum ?? null;
  }

  get notes(): string | null {
    return this.props.notes ?? null;
  }

  get metadata(): Record<string, unknown> | null {
    return this.props.metadata ?? null;
  }

  get uploadedBy(): string | null {
    return this.props.uploadedBy ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON(): DocumentVersionProps {
    return { ...this.props };
  }
}
