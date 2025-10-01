import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  PaymentStatus,
  PaymentTransactionEntity,
  PaymentTransactionRepository,
} from '../../domain/repositories/payment-transaction.repository';

type PaymentTransactionRecord = {
  id: string;
  subscriptionId: string;
  status: string;
  amount: number;
  currency: string;
  paymentType: string | null;
  midtransOrderId: string;
  midtransTransactionId: string | null;
  snapToken: string | null;
  snapRedirectUrl: string | null;
  rawResponse: unknown;
  metadata: unknown;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaPaymentTransactionRepository
  implements PaymentTransactionRepository
{
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
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        midtransOrderId: transaction.midtransOrderId,
        metadata: transaction.metadata ?? undefined,
      },
    });

    return this.toEntity(record as PaymentTransactionRecord);
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        PaymentTransactionEntity,
        | 'status'
        | 'paymentType'
        | 'midtransTransactionId'
        | 'snapToken'
        | 'snapRedirectUrl'
        | 'rawResponse'
        | 'metadata'
        | 'paidAt'
      >
    >,
  ): Promise<PaymentTransactionEntity> {
    const record = await this.prisma.paymentTransaction.update({
      where: { id },
      data: {
        status: data.status ?? undefined,
        paymentType: data.paymentType ?? undefined,
        midtransTransactionId: data.midtransTransactionId ?? undefined,
        snapToken: data.snapToken ?? undefined,
        snapRedirectUrl: data.snapRedirectUrl ?? undefined,
        rawResponse: data.rawResponse ?? undefined,
        metadata: data.metadata ?? undefined,
        paidAt: data.paidAt ?? undefined,
      },
    });

    return this.toEntity(record as PaymentTransactionRecord);
  }

  async findByMidtransOrderId(
    orderId: string,
  ): Promise<PaymentTransactionEntity | null> {
    const record = await this.prisma.paymentTransaction.findUnique({
      where: { midtransOrderId: orderId },
    });

  return record ? this.toEntity(record as PaymentTransactionRecord) : null;
  }

  private toEntity(
    record: PaymentTransactionRecord,
  ): PaymentTransactionEntity {
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

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }
}
