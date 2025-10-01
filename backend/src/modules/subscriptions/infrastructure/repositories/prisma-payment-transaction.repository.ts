import { Injectable } from '@nestjs/common';
import { PaymentStatus as PrismaPaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import {
  PaymentStatus,
  PaymentTransactionEntity,
  PaymentTransactionRepository,
} from '../../domain/repositories/payment-transaction.repository';

@Injectable()
export class PrismaPaymentTransactionRepository implements PaymentTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    transaction: Pick<
      PaymentTransactionEntity,
      'subscriptionId' | 'status' | 'amount' | 'currency' | 'midtransOrderId'
    > & { metadata?: Record<string, unknown> | null },
  ): Promise<PaymentTransactionEntity> {
    const record = await this.prisma.paymentTransaction.create({
      data: {
        subscriptionId: transaction.subscriptionId,
        status: transaction.status as PrismaPaymentStatus,
        amount: transaction.amount,
        currency: transaction.currency,
        midtransOrderId: transaction.midtransOrderId,
        metadata: transaction.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return this.toEntity(record);
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        PaymentTransactionEntity,
        'status' | 'paymentType' | 'midtransTransactionId' | 'snapToken' | 'snapRedirectUrl' | 'rawResponse' | 'metadata' | 'paidAt'
      >
    >,
  ): Promise<PaymentTransactionEntity> {
    const record = await this.prisma.paymentTransaction.update({
      where: { id },
      data: {
        status: data.status ? (data.status as PrismaPaymentStatus) : undefined,
        paymentType: data.paymentType ?? undefined,
        midtransTransactionId: data.midtransTransactionId ?? undefined,
        snapToken: data.snapToken ?? undefined,
        snapRedirectUrl: data.snapRedirectUrl ?? undefined,
        rawResponse: data.rawResponse as Prisma.InputJsonValue | undefined,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        paidAt: data.paidAt ?? undefined,
      },
    });

    return this.toEntity(record);
  }

  async findByMidtransOrderId(orderId: string): Promise<PaymentTransactionEntity | null> {
    const record = await this.prisma.paymentTransaction.findUnique({
      where: { midtransOrderId: orderId },
    });

    return record ? this.toEntity(record) : null;
  }

  private toEntity(record: Prisma.PaymentTransaction): PaymentTransactionEntity {
    return {
      id: record.id,
      subscriptionId: record.subscriptionId,
      status: record.status as PaymentStatus,
      amount: record.amount,
      currency: record.currency,
      paymentType: record.paymentType,
      midtransOrderId: record.midtransOrderId,
      midtransTransactionId: record.midtransTransactionId,
      snapToken: record.snapToken,
      snapRedirectUrl: record.snapRedirectUrl,
      rawResponse: this.asRecord(record.rawResponse),
      metadata: this.asRecord(record.metadata),
      paidAt: record.paidAt,
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
