import { Injectable, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../../database/prisma.service';
import { BusinessProfile } from '../../domain/entities/business-profile.entity';
import {
  BusinessPermitProfile,
  JsonValue,
} from '../../domain/entities/business-permit-profile.entity';
import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';
import { PermitType } from '../../domain/enums/permit-type.enum';
import { BusinessProfileRepository } from '../../domain/repositories/business-profile.repository';

type Nullable<T> = T | null | undefined;
interface PrismaBusinessPermitProfileRow {
  id: string;
  businessProfileId: string;
  permitType: string;
  formData: JsonValue | null;
  fieldChecklist: JsonValue | null;
  documents: JsonValue | null;
  isChecklistComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaBusinessProfileRow {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  businessScale: string;
  province: string | null;
  city: string | null;
  address: string | null;
  industryTags: string[] | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  permits?: PrismaBusinessPermitProfileRow[];
}

interface BusinessProfileFindUniqueArgs {
  where: { userId?: string; id?: string };
  include?: { permits?: boolean };
}

interface BusinessProfileCreateInput {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  businessScale: string;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  industryTags: string[];
  completedAt: Date | null;
  createdAt: Date;
}

interface BusinessProfileUpdateInput {
  businessName: string;
  businessType: string;
  businessScale: string;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  industryTags: string[];
  completedAt: Date | null;
}

interface BusinessProfileUpsertArgs {
  where: { id: string };
  create: BusinessProfileCreateInput;
  update: BusinessProfileUpdateInput;
}

interface BusinessProfileDelegate {
  findUnique(
    args: BusinessProfileFindUniqueArgs,
  ): Promise<PrismaBusinessProfileRow | null>;
  upsert(args: BusinessProfileUpsertArgs): Promise<unknown>;
}
@Injectable()
export class PrismaBusinessProfileRepository
  implements BusinessProfileRepository
{
  private readonly logger = new Logger(PrismaBusinessProfileRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<BusinessProfile | null> {
    try {
      const profile = await this.getBusinessProfileDelegate().findUnique({
        where: { userId },
        include: { permits: true },
      });

      return profile ? this.toDomain(profile) : null;
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'BusinessProfile table is missing. Returning null for workspace summary.',
        );
        return null;
      }
      throw error;
    }
  }

  async findById(id: string): Promise<BusinessProfile | null> {
    try {
      const profile = await this.getBusinessProfileDelegate().findUnique({
        where: { id },
        include: { permits: true },
      });

      return profile ? this.toDomain(profile) : null;
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.logger.warn(
          'BusinessProfile table is missing. Returning null for workspace lookup.',
        );
        return null;
      }
      throw error;
    }
  }

  async save(profile: BusinessProfile): Promise<void> {
    const data = profile.toJSON();
    const businessType = this.toBusinessTypeValue(data.businessType);
    const businessScale = this.toBusinessScaleValue(data.businessScale);
    const industryTags = Array.isArray(data.industryTags)
      ? data.industryTags
      : [];

    await this.getBusinessProfileDelegate().upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        businessName: data.businessName,
        businessType,
        businessScale,
        province: this.toNullable(data.province),
        city: this.toNullable(data.city),
        address: this.toNullable(data.address),
        industryTags,
        completedAt: data.completedAt ?? null,
        createdAt: data.createdAt,
      },
      update: {
        businessName: data.businessName,
        businessType,
        businessScale,
        province: this.toNullable(data.province),
        city: this.toNullable(data.city),
        address: this.toNullable(data.address),
        industryTags,
        completedAt: data.completedAt ?? null,
      },
    });
  }

  private toDomain(profile: PrismaBusinessProfileRow): BusinessProfile {
    const permitRows = Array.isArray(profile.permits) ? profile.permits : [];
    const permits = permitRows.map((permit) =>
      BusinessPermitProfile.create({
        id: permit.id,
        businessProfileId: permit.businessProfileId,
        permitType: permit.permitType as PermitType,
        formData: permit.formData,
        fieldChecklist: permit.fieldChecklist,
        documents: permit.documents,
        isChecklistComplete: Boolean(permit.isChecklistComplete),
        createdAt: permit.createdAt,
        updatedAt: permit.updatedAt,
      }),
    );

    return BusinessProfile.create({
      id: profile.id,
      userId: profile.userId,
      businessName: profile.businessName,
      businessType: this.toBusinessType(profile.businessType),
      businessScale: this.toBusinessScale(profile.businessScale),
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

  private getBusinessProfileDelegate(): BusinessProfileDelegate {
    return this.prisma.businessProfile as unknown as BusinessProfileDelegate;
  }

  private toBusinessTypeValue(value: string): string {
    return this.toBusinessType(value);
  }

  private toBusinessScaleValue(value: string): string {
    return this.toBusinessScale(value);
  }

  private toBusinessType(value: string): BusinessType {
    return this.ensureEnumValue(value, BusinessType, BusinessType.OTHER);
  }

  private toBusinessScale(value: string): BusinessScale {
    return this.ensureEnumValue(value, BusinessScale, BusinessScale.MICRO);
  }

  private ensureEnumValue<T extends Record<string, string>>(
    value: string,
    enumObj: T,
    fallback: T[keyof T],
  ): T[keyof T] {
    return Object.values(enumObj).some((enumValue) => enumValue === value)
      ? (value as T[keyof T])
      : fallback;
  }

  private isMissingTableError(error: unknown): boolean {
    return (
      error instanceof PrismaClientKnownRequestError && error.code === 'P2021'
    );
  }
}
