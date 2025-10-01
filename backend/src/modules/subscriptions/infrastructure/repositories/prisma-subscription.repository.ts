import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  SubscriptionEntity,
  SubscriptionRepository,
  SubscriptionStatus,
} from '../../domain/repositories/subscription.repository';
import { SubscriptionPlanEntity } from '../../domain/repositories/subscription-plan.repository';

type SubscriptionPlanRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: SubscriptionPlanEntity['billingPeriod'];
  isActive: boolean;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type SubscriptionRecord = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  midtransSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  plan?: SubscriptionPlanRecord | null;
};

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const record = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'PENDING'] as SubscriptionStatus[],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    return record ? this.toEntity(record) : null;
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const record = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    return record ? this.toEntity(record) : null;
  }

  async create(
    subscription: Pick<
      SubscriptionEntity,
      | 'userId'
      | 'planId'
      | 'status'
      | 'cancelAtPeriodEnd'
      | 'currentPeriodStart'
      | 'currentPeriodEnd'
      | 'midtransSubscriptionId'
    >,
  ): Promise<SubscriptionEntity> {
    const record = await this.prisma.subscription.create({
      data: {
        userId: subscription.userId,
        planId: subscription.planId,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        midtransSubscriptionId: subscription.midtransSubscriptionId,
      },
      include: { plan: true },
    });

    return this.toEntity(record);
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        SubscriptionEntity,
        | 'status'
        | 'currentPeriodStart'
        | 'currentPeriodEnd'
        | 'cancelAtPeriodEnd'
        | 'midtransSubscriptionId'
      >
    >,
  ): Promise<SubscriptionEntity> {
    const record = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: data.status ?? undefined,
        currentPeriodStart: data.currentPeriodStart ?? undefined,
        currentPeriodEnd: data.currentPeriodEnd ?? undefined,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? undefined,
        midtransSubscriptionId: data.midtransSubscriptionId ?? undefined,
      },
      include: { plan: true },
    });

    return this.toEntity(record);
  }

  private toEntity(
    record: SubscriptionRecord,
  ): SubscriptionEntity & { plan?: SubscriptionPlanEntity } {
    return {
      id: record.id,
      userId: record.userId,
      planId: record.planId,
      status: record.status,
      currentPeriodStart: record.currentPeriodStart,
      currentPeriodEnd: record.currentPeriodEnd,
      cancelAtPeriodEnd: record.cancelAtPeriodEnd,
      midtransSubscriptionId: record.midtransSubscriptionId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      plan: record.plan
        ? {
            id: record.plan.id,
            name: record.plan.name,
            description: record.plan.description,
            price: record.plan.price,
            currency: record.plan.currency,
            billingPeriod: record.plan.billingPeriod,
            isActive: record.plan.isActive,
            metadata: this.asRecord(record.plan.metadata),
            createdAt: record.plan.createdAt,
            updatedAt: record.plan.updatedAt,
          }
        : undefined,
    };
  }

  private asRecord(
    value: unknown,
  ): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }
}
