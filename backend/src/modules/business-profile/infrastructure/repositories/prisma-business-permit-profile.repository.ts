import { Injectable } from '@nestjs/common';
import { BusinessPermitProfile as PrismaBusinessPermitProfile, Prisma, $Enums } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { BusinessPermitProfile, JsonValue } from '../../domain/entities/business-permit-profile.entity';
import { PermitType } from '../../domain/enums/permit-type.enum';
import { BusinessPermitProfileRepository } from '../../domain/repositories/business-permit-profile.repository';

type PrismaPermitWithRelations = PrismaBusinessPermitProfile;

@Injectable()
export class PrismaBusinessPermitProfileRepository implements BusinessPermitProfileRepository {
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

  async findManyByProfileId(businessProfileId: string): Promise<BusinessPermitProfile[]> {
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
        permitType: data.permitType as $Enums.PermitType,
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

  private toDomain(permit: PrismaPermitWithRelations): BusinessPermitProfile {
    return BusinessPermitProfile.create({
      id: permit.id,
      businessProfileId: permit.businessProfileId,
      permitType: permit.permitType as PermitType,
      formData: permit.formData as JsonValue | null,
      fieldChecklist: permit.fieldChecklist as JsonValue | null,
      documents: permit.documents as JsonValue | null,
      isChecklistComplete: permit.isChecklistComplete,
      createdAt: permit.createdAt,
      updatedAt: permit.updatedAt,
    });
  }

  private toJsonInput(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return Prisma.JsonNull;
    }
    return value as Prisma.InputJsonValue;
  }
}
