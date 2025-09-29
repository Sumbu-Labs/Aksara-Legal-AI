import { IsBoolean, IsObject, IsOptional } from 'class-validator';

type JsonRecord = Record<string, unknown>;

type Nullable<T> = T | null | undefined;

export class UpdatePermitProfileDto {
  @IsOptional()
  @IsObject()
  formData?: Nullable<JsonRecord>;

  @IsOptional()
  @IsObject()
  fieldChecklist?: Nullable<JsonRecord>;

  @IsOptional()
  @IsBoolean()
  isChecklistComplete?: boolean;
}
