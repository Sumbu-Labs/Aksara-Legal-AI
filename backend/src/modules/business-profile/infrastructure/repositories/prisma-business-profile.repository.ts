import { Injectable } from '@nestjs/common';
import {
  BusinessProfile as PrismaBusinessProfile,
  BusinessPermitProfile as PrismaBusinessPermitProfile,
  Prisma,
  $Enums,
} from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { BusinessProfile } from '../../domain/entities/business-profile.entity';
import { BusinessPermitProfile, JsonValue } from '../../domain/entities/business-permit-profile.entity';
import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';
import { PermitType } from '../../domain/enums/permit-type.enum';
import { BusinessProfileRepository } from '../../domain/repositories/business-profile.repository';

type Nullable<T> = T | null | undefined;

@Injectable()
export class PrismaBusinessProfileRepository implements BusinessProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<BusinessProfile | null> {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: { permits: true },
    });

    return profile ? this.toDomain(profile) : null;
  }

  async findById(id: string): Promise<BusinessProfile | null> {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { id },
      include: { permits: true },
    });

    return profile ? this.toDomain(profile) : null;
  }

  async save(profile: BusinessProfile): Promise<void> {
    const data = profile.toJSON();

    await this.prisma.businessProfile.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        businessName: data.businessName,
        businessType: data.businessType as $Enums.BusinessType,
        businessScale: data.businessScale as $Enums.BusinessScale,
        province: this.toNullable(data.province),
        city: this.toNullable(data.city),
        address: this.toNullable(data.address),
        industryTags: data.industryTags ?? [],
        completedAt: data.completedAt,
        createdAt: data.createdAt,
      },
      update: {
        businessName: data.businessName,
        businessType: data.businessType as $Enums.BusinessType,
        businessScale: data.businessScale as $Enums.BusinessScale,
        province: this.toNullable(data.province),
        city: this.toNullable(data.city),
        address: this.toNullable(data.address),
        industryTags: data.industryTags ?? [],
        completedAt: data.completedAt,
      },
    });
  }

  private toDomain(profile: PrismaBusinessProfile & { permits: PrismaBusinessPermitProfile[] }): BusinessProfile {
    const permits = profile.permits.map((permit) =>
      BusinessPermitProfile.create({
        id: permit.id,
        businessProfileId: permit.businessProfileId,
        permitType: permit.permitType as PermitType,
        formData: permit.formData as JsonValue | null,
        fieldChecklist: permit.fieldChecklist as JsonValue | null,
        documents: permit.documents as JsonValue | null,
        isChecklistComplete: permit.isChecklistComplete,
        createdAt: permit.createdAt,
        updatedAt: permit.updatedAt,
      }),
    );

    return BusinessProfile.create({
      id: profile.id,
      userId: profile.userId,
      businessName: profile.businessName,
      businessType: profile.businessType as BusinessType,
      businessScale: profile.businessScale as BusinessScale,
      province: profile.province,
      city: profile.city,
      address: profile.address,
      industryTags: profile.industryTags ?? [],
      completedAt: profile.completedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      permits,
    });
  }

  private toNullable(value: Nullable<string>): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    return value;
  }
}
