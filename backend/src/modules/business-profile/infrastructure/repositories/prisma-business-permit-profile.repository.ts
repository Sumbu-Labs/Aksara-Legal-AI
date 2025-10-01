import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  BusinessPermitProfile,
  JsonValue,
} from '../../domain/entities/business-permit-profile.entity';
import { PermitType } from '../../domain/enums/permit-type.enum';
import { BusinessPermitProfileRepository } from '../../domain/repositories/business-permit-profile.repository';

type PrismaBusinessPermitProfileRecord = {
  id: string;
  businessProfileId: string;
  permitType: PermitType;
  formData: JsonValue | null;
  fieldChecklist: JsonValue | null;
  documents: JsonValue | null;
  isChecklistComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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
      permitType: permit.permitType,
      formData: permit.formData,
      fieldChecklist: permit.fieldChecklist,
      documents: permit.documents,
      isChecklistComplete: permit.isChecklistComplete,
      createdAt: permit.createdAt,
      updatedAt: permit.updatedAt,
    });
  }

  private toJsonInput(
    value: JsonValue | null | undefined,
  ): JsonValue | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    return value ?? null;
  }
}
