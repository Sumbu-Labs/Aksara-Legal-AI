import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import {
  BusinessPermitProfile,
  JsonValue,
} from '../../domain/entities/business-permit-profile.entity';
import { PermitType } from '../../domain/enums/permit-type.enum';
import { BusinessPermitProfileRepository } from '../../domain/repositories/business-permit-profile.repository';

type PrismaBusinessPermitProfileRecord = NonNullable<
  Awaited<
    ReturnType<PrismaService['businessPermitProfile']['findUnique']>
  >
>;

@Injectable()
export class PrismaBusinessPermitProfileRepository
  implements BusinessPermitProfileRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileAndType(
    businessProfileId: string,
    permitType: PermitType,
  ): Promise<BusinessPermitProfile | null> {
    const permit = await this.prisma.businessPermitProfile.findUnique({
      where: {
        businessProfileId_permitType: {
          businessProfileId,
          permitType,
        },
      },
    });

    return permit ? this.toDomain(permit) : null;
  }

  async findManyByProfileId(
    businessProfileId: string,
  ): Promise<BusinessPermitProfile[]> {
    const permits = await this.prisma.businessPermitProfile.findMany({
      where: { businessProfileId },
    });

    return permits.map((permit) => this.toDomain(permit));
  }

  async save(permitProfile: BusinessPermitProfile): Promise<void> {
    const data = permitProfile.toJSON();

    await this.prisma.businessPermitProfile.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        businessProfileId: data.businessProfileId,
        permitType: data.permitType,
        formData: this.toJsonInput(data.formData),
        fieldChecklist: this.toJsonInput(data.fieldChecklist),
        documents: this.toJsonInput(data.documents),
        isChecklistComplete: data.isChecklistComplete,
        createdAt: data.createdAt,
      },
      update: {
        formData: this.toJsonInput(data.formData),
        fieldChecklist: this.toJsonInput(data.fieldChecklist),
        documents: this.toJsonInput(data.documents),
        isChecklistComplete: data.isChecklistComplete,
      },
    });
  }

  private toDomain(
    permit: PrismaBusinessPermitProfileRecord,
  ): BusinessPermitProfile {
    return BusinessPermitProfile.create({
      id: permit.id,
      businessProfileId: permit.businessProfileId,
      permitType: this.toDomainPermitType(permit.permitType),
      formData: this.fromJsonValue(permit.formData),
      fieldChecklist: this.fromJsonValue(permit.fieldChecklist),
      documents: this.fromJsonValue(permit.documents),
      isChecklistComplete: permit.isChecklistComplete,
      createdAt: permit.createdAt,
      updatedAt: permit.updatedAt,
    });
  }

  private toJsonInput(
    value: JsonValue | null | undefined,
  ): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as unknown as Prisma.InputJsonValue;
  }

  private fromJsonValue(value: unknown): JsonValue | null {
    if (value === null) {
      return null;
    }

    return value as JsonValue;
  }

  private toDomainPermitType(permitType: string): PermitType {
    if (!this.isPermitType(permitType)) {
      throw new Error(`Unexpected permit type received from database: ${permitType}`);
    }

    return permitType as PermitType;
  }

  private isPermitType(value: string): value is PermitType {
    return Object.values(PermitType).includes(value as PermitType);
  }
}
