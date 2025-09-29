import { randomUUID } from 'crypto';
import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';
import { DocumentVersion } from './document-version.entity';

type Nullable<T> = T | null | undefined;

export interface DocumentProps {
  id: string;
  userId: string;
  businessProfileId?: string | null;
  permitType?: PermitType | null;
  label?: string | null;
  currentVersion?: DocumentVersion | null;
  versions: DocumentVersion[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateDocumentParams {
  id?: string;
  userId: string;
  businessProfileId?: string | null;
  permitType?: PermitType | null;
  label?: string | null;
  currentVersion?: DocumentVersion | null;
  versions?: DocumentVersion[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Document {
  private constructor(private props: DocumentProps) {}

  static create(params: CreateDocumentParams): Document {
    const now = new Date();
    return new Document({
      id: params.id ?? randomUUID(),
      userId: params.userId,
      businessProfileId: params.businessProfileId ?? null,
      permitType: params.permitType ?? null,
      label: params.label ?? null,
      currentVersion: params.currentVersion ?? null,
      versions: params.versions ?? [],
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
      deletedAt: params.deletedAt ?? null,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get businessProfileId(): Nullable<string> {
    return this.props.businessProfileId ?? null;
  }

  get permitType(): Nullable<PermitType> {
    return this.props.permitType ?? null;
  }

  get label(): Nullable<string> {
    return this.props.label ?? null;
  }

  get currentVersion(): Nullable<DocumentVersion> {
    return this.props.currentVersion ?? null;
  }

  get versions(): DocumentVersion[] {
    return this.props.versions;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Nullable<Date> {
    return this.props.deletedAt ?? null;
  }

  updateLabel(label: Nullable<string>): void {
    this.props.label = label ?? null;
    this.touch();
  }

  assignPermitType(permitType: Nullable<PermitType>): void {
    this.props.permitType = permitType ?? null;
    this.touch();
  }

  assignBusinessProfile(businessProfileId: Nullable<string>): void {
    this.props.businessProfileId = businessProfileId ?? null;
    this.touch();
  }

  addVersion(version: DocumentVersion, setCurrent = true): void {
    this.props.versions = [...this.props.versions, version];
    if (setCurrent) {
      this.props.currentVersion = version;
    }
    this.touch();
  }

  setCurrentVersion(version: DocumentVersion): void {
    this.props.currentVersion = version;
    this.touch();
  }

  markDeleted(): void {
    const now = new Date();
    this.props.deletedAt = now;
    this.touch(now);
  }

  restore(): void {
    this.props.deletedAt = null;
    this.touch();
  }

  toJSON(): DocumentProps {
    return { ...this.props };
  }

  private touch(date: Date = new Date()): void {
    this.props.updatedAt = date;
  }
}
