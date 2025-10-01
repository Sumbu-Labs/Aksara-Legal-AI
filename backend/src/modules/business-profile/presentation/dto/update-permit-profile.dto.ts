import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';

type JsonRecord = Record<string, unknown>;

type Nullable<T> = T | null | undefined;

export class UpdatePermitProfileDto {
  @ApiPropertyOptional({
    description: 'Data form dinamis',
    type: Object,
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  formData?: Nullable<JsonRecord>;

  @ApiPropertyOptional({
    description: 'Status checklist per field',
    type: Object,
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  fieldChecklist?: Nullable<JsonRecord>;

  @ApiPropertyOptional({ description: 'Apakah checklist izin telah lengkap' })
  @IsOptional()
  @IsBoolean()
  isChecklistComplete?: boolean;
}
