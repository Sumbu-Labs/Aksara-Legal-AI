import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';

export class UploadDocumentRequestDto {
  @ApiPropertyOptional({ description: 'Tautan ke profil bisnis terkait' })
  @IsOptional()
  @IsString()
  businessProfileId?: string;

  @ApiPropertyOptional({ enum: PermitType })
  @IsOptional()
  @IsEnum(PermitType)
  permitType?: PermitType;

  @ApiPropertyOptional({ description: 'Label dokumen yang mudah dibaca' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Catatan khusus' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Metadata tambahan dalam bentuk JSON string' })
  @IsOptional()
  @IsString()
  metadata?: string;
}

export class BatchUploadDocumentRequestDto {
  @ApiPropertyOptional({ description: 'Metadata per dokumen dalam urutan yang sama dengan file, dalam bentuk JSON string array' })
  @IsOptional()
  @IsString()
  metadata?: string;
}
