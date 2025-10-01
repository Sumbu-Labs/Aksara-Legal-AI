import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';

export class UpdateBusinessProfileDto {
  @ApiPropertyOptional({ description: 'Nama bisnis' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ enum: BusinessType })
  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @ApiPropertyOptional({ enum: BusinessScale })
  @IsOptional()
  @IsEnum(BusinessScale)
  businessScale?: BusinessScale;

  @ApiPropertyOptional({
    description: 'Provinsi lokasi bisnis',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  province?: string | null;

  @ApiPropertyOptional({
    description: 'Kota/Kabupaten lokasi bisnis',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ description: 'Alamat lengkap', nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ description: 'Tag industri terkait', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryTags?: string[];
}
