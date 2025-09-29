import { BusinessProfile } from '../../domain/entities/business-profile.entity';
import { BusinessPermitProfileDto } from './business-permit-profile.dto';

type Nullable<T> = T | null | undefined;

export class BusinessProfileResponseDto {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  businessScale: string;
  province: Nullable<string>;
  city: Nullable<string>;
  address: Nullable<string>;
  industryTags: string[];
  completedAt: Nullable<Date>;
  createdAt: Date;
  updatedAt: Date;
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
      permits: profile.permits.map((permit) => BusinessPermitProfileDto.fromDomain(permit)),
    };
  }
}
