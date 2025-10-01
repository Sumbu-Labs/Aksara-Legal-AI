import { ApiProperty } from '@nestjs/swagger';
import { BusinessProfile } from '../../domain/entities/business-profile.entity';
import { BusinessPermitProfileDto } from './business-permit-profile.dto';

type Nullable<T> = T | null | undefined;

export class BusinessProfileResponseDto {
  @ApiProperty({ description: 'ID profil bisnis' })
  id: string;
  @ApiProperty({ description: 'ID pemilik (user)' })
  userId: string;
  @ApiProperty({ description: 'Nama bisnis' })
  businessName: string;
  @ApiProperty({
    description: 'Jenis bisnis',
    enum: [
      'FOOD_BEVERAGE',
      'TECH_STARTUP',
      'SERVICES',
      'MANUFACTURING',
      'RETAIL',
      'OTHER',
    ],
  })
  businessType: string;
  @ApiProperty({
    description: 'Skala bisnis',
    enum: ['MICRO', 'SMALL', 'MEDIUM', 'LARGE'],
  })
  businessScale: string;
  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Provinsi lokasi bisnis',
  })
  province: Nullable<string>;
  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Kota/Kabupaten lokasi bisnis',
  })
  city: Nullable<string>;
  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Alamat lengkap',
  })
  address: Nullable<string>;
  @ApiProperty({ description: 'Tag industri terkait', type: [String] })
  industryTags: string[];
  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Tanggal profil dinyatakan lengkap',
  })
  completedAt: Nullable<Date>;
  @ApiProperty({ description: 'Tanggal dibuat' })
  createdAt: Date;
  @ApiProperty({ description: 'Terakhir diperbarui' })
  updatedAt: Date;
  @ApiProperty({ type: () => [BusinessPermitProfileDto] })
  permits: BusinessPermitProfileDto[];

  static fromDomain(profile: BusinessProfile): BusinessProfileResponseDto {
    const raw = profile.toJSON();
    return {
      id: profile.id,
      userId: profile.userId,
      businessName: profile.businessName,
      businessType: profile.businessType,
      businessScale: profile.businessScale,
      province: profile.province,
      city: profile.city,
      address: profile.address,
      industryTags: profile.industryTags,
      completedAt: profile.completedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      permits: profile.permits.map((permit) =>
        BusinessPermitProfileDto.fromDomain(permit),
      ),
    };
  }
}
