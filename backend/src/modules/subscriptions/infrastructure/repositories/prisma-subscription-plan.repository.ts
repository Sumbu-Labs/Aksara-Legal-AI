import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { jsonValueToRecord, JsonValue } from '../../../../common/types/json';
import {
  SubscriptionPlanEntity,
  SubscriptionPlanRepository,
} from '../../domain/repositories/subscription-plan.repository';

type SubscriptionPlanRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: SubscriptionPlanEntity['billingPeriod'];
  isActive: boolean;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaSubscriptionPlanRepository
  implements SubscriptionPlanRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<SubscriptionPlanEntity[]> {
    const records = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return records.map((record) =>
      this.toEntity(record as SubscriptionPlanRecord),
    );
  }

  async findById(id: string): Promise<SubscriptionPlanEntity | null> {
    const record = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    return record ? this.toEntity(record as SubscriptionPlanRecord) : null;
  }

  private toEntity(record: SubscriptionPlanRecord): SubscriptionPlanEntity {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      price: record.price,
      currency: record.currency,
      billingPeriod: record.billingPeriod,
      isActive: record.isActive,
      metadata: jsonValueToRecord(record.metadata),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
