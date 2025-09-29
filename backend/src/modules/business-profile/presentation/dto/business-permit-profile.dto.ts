import { ApiProperty } from '@nestjs/swagger';
import { BusinessPermitProfile, JsonValue } from '../../domain/entities/business-permit-profile.entity';
import { PermitType } from '../../domain/enums/permit-type.enum';

type Nullable<T> = T | null | undefined;

export class BusinessPermitProfileDto {
  @ApiProperty({ description: 'ID profil perizinan' })
  id: string;
  @ApiProperty({ enum: PermitType })
  permitType: PermitType;
  @ApiProperty({ required: false, nullable: true, description: 'Data form dinamis untuk perizinan', type: Object, additionalProperties: true })
  formData: Nullable<JsonValue>;
  @ApiProperty({ required: false, nullable: true, description: 'Status checklist per field', type: Object, additionalProperties: true })
  fieldChecklist: Nullable<JsonValue>;
  @ApiProperty({ required: false, nullable: true, description: 'Metadata dokumen terunggah', type: Object, additionalProperties: true })
  documents: Nullable<JsonValue>;
  @ApiProperty({ description: 'Status apakah seluruh checklist izin terpenuhi' })
  isChecklistComplete: boolean;
  @ApiProperty({ description: 'Terakhir diperbarui' })
  updatedAt: Date;
  @ApiProperty({ description: 'Waktu pembuatan' })
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
