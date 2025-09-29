import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';

export class UpdateBusinessProfileDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @IsOptional()
  @IsEnum(BusinessScale)
  businessScale?: BusinessScale;

  @IsOptional()
  @IsString()
  province?: string | null;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryTags?: string[];
}
