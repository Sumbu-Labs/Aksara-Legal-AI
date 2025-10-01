import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import {
  SubscriptionPlanEntity,
  SubscriptionPlanRepository,
} from '../../domain/repositories/subscription-plan.repository';

@Injectable()
export class PrismaSubscriptionPlanRepository implements SubscriptionPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<SubscriptionPlanEntity[]> {
    const records = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return records.map((record) => this.toEntity(record));
  }

  async findById(id: string): Promise<SubscriptionPlanEntity | null> {
    const record = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  private toEntity(record: Prisma.SubscriptionPlan): SubscriptionPlanEntity {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      price: record.price,
      currency: record.currency,
      billingPeriod: record.billingPeriod,
      isActive: record.isActive,
      metadata: this.asRecord(record.metadata),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private asRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }
}
