import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';

export class CreateBusinessProfileDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsEnum(BusinessType)
  businessType: BusinessType;

  @IsEnum(BusinessScale)
  businessScale: BusinessScale;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  province?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryTags?: string[];
}
