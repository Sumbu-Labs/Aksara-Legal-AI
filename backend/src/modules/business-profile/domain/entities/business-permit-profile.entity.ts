import { randomUUID } from 'crypto';
import { PermitType } from '../enums/permit-type.enum';

type Nullable<T> = T | null | undefined;

export type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface BusinessPermitProfileProps {
  id: string;
  businessProfileId: string;
  permitType: PermitType;
  formData?: JsonValue;
  fieldChecklist?: JsonValue;
  documents?: JsonValue;
  isChecklistComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessPermitProfileParams {
  id?: string;
  businessProfileId: string;
  permitType: PermitType;
  formData?: JsonValue;
  fieldChecklist?: JsonValue;
  documents?: JsonValue;
  isChecklistComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BusinessPermitProfile {
  private constructor(private props: BusinessPermitProfileProps) {}

  static create(params: CreateBusinessPermitProfileParams): BusinessPermitProfile {
    const now = new Date();
    return new BusinessPermitProfile({
      id: params.id ?? randomUUID(),
      businessProfileId: params.businessProfileId,
      permitType: params.permitType,
      formData: params.formData,
      fieldChecklist: params.fieldChecklist,
      documents: params.documents,
      isChecklistComplete: params.isChecklistComplete ?? false,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get businessProfileId(): string {
    return this.props.businessProfileId;
  }

  get permitType(): PermitType {
    return this.props.permitType;
  }

  get formData(): Nullable<JsonValue> {
    return this.props.formData ?? null;
  }

  get fieldChecklist(): Nullable<JsonValue> {
    return this.props.fieldChecklist ?? null;
  }

  get documents(): Nullable<JsonValue> {
    return this.props.documents ?? null;
  }

  get isChecklistComplete(): boolean {
    return this.props.isChecklistComplete;
  }

  update(payload: {
    formData?: Nullable<JsonValue>;
    fieldChecklist?: Nullable<JsonValue>;
    documents?: Nullable<JsonValue>;
    isChecklistComplete?: boolean;
  }): void {
    if (payload.formData !== undefined) {
      this.props.formData = payload.formData ?? null;
    }
    if (payload.fieldChecklist !== undefined) {
      this.props.fieldChecklist = payload.fieldChecklist ?? null;
    }
    if (payload.documents !== undefined) {
      this.props.documents = payload.documents ?? null;
    }
    if (payload.isChecklistComplete !== undefined) {
      this.props.isChecklistComplete = payload.isChecklistComplete;
    }
    this.touch();
  }

  toJSON(): BusinessPermitProfileProps {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
