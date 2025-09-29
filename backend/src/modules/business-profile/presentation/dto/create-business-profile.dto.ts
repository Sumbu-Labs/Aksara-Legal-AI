import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';

export class CreateBusinessProfileDto {
  @ApiProperty({ description: 'Nama bisnis' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ enum: BusinessType })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiProperty({ enum: BusinessScale })
  @IsEnum(BusinessScale)
  businessScale: BusinessScale;

  @ApiPropertyOptional({ description: 'Provinsi lokasi bisnis', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  province?: string | null;

  @ApiPropertyOptional({ description: 'Kota/Kabupaten lokasi bisnis', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string | null;

  @ApiPropertyOptional({ description: 'Alamat lengkap bisnis', nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ description: 'Tag industri terkait', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryTags?: string[];
}
