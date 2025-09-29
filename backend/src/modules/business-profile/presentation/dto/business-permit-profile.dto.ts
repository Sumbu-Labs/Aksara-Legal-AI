import { BusinessPermitProfile, JsonValue } from '../../domain/entities/business-permit-profile.entity';
import { PermitType } from '../../domain/enums/permit-type.enum';

type Nullable<T> = T | null | undefined;

export class BusinessPermitProfileDto {
  id: string;
  permitType: PermitType;
  formData: Nullable<JsonValue>;
  fieldChecklist: Nullable<JsonValue>;
  documents: Nullable<JsonValue>;
  isChecklistComplete: boolean;
  updatedAt: Date;
  createdAt: Date;

  static fromDomain(permit: BusinessPermitProfile): BusinessPermitProfileDto {
    const raw = permit.toJSON();
    return {
      id: permit.id,
      permitType: permit.permitType,
      formData: permit.formData,
      fieldChecklist: permit.fieldChecklist,
      documents: permit.documents,
      isChecklistComplete: permit.isChecklistComplete,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
