import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { PaymentStatus } from '../../domain/repositories/payment-transaction.repository';
import {
  SUBSCRIPTION_REPOSITORY,
  PAYMENT_TRANSACTION_REPOSITORY,
} from '../../common/subscription.constants';
import { SubscriptionPlansService } from './subscription-plans.service';
import {
  SubscriptionEntity,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository';
import {
  PaymentTransactionEntity,
  PaymentTransactionRepository,
} from '../../domain/repositories/payment-transaction.repository';
import { CreateSubscriptionCommand } from '../dto/create-subscription.command';
import {
  MidtransService,
  MidtransNotificationPayload,
} from '../../infrastructure/midtrans/midtrans.service';

export type SubscriptionCheckoutResult = {
  subscription: SubscriptionEntity;
  payment: PaymentTransactionEntity;
};

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionPlansService: SubscriptionPlansService,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(PAYMENT_TRANSACTION_REPOSITORY)
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
    private readonly midtransService: MidtransService,
  ) {}

  async getActiveSubscription(
    userId: string,
  ): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  async createSubscriptionCheckout(
    command: CreateSubscriptionCommand,
  ): Promise<SubscriptionCheckoutResult> {
    const plan = await this.subscriptionPlansService.getPlanById(
      command.planId,
    );
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Paket langganan tidak ditemukan');
    }

    const existing = await this.subscriptionRepository.findActiveByUserId(
      command.userId,
    );
    if (
      existing &&
      (existing.status === 'ACTIVE' || existing.status === 'PENDING')
    ) {
      throw new ConflictException(
        'Pengguna sudah memiliki langganan aktif atau menunggu pembayaran',
      );
    }

    const subscription = await this.subscriptionRepository.create({
      userId: command.userId,
      planId: plan.id,
      status: 'PENDING',
      cancelAtPeriodEnd: false,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      midtransSubscriptionId: null,
    });

    const orderId = this.generateOrderId(subscription.id);
    const payment = await this.paymentTransactionRepository.create({
      subscriptionId: subscription.id,
      status: 'PENDING',
      amount: plan.price,
      currency: plan.currency,
      midtransOrderId: orderId,
      metadata: {
        planId: plan.id,
        planName: plan.name,
      },
    });

    const snapResponse = await this.midtransService.createSnapTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: plan.price,
      },
      customer_details: {
        first_name: command.customer.name,
        email: command.customer.email,
      },
      item_details: [
        {
          id: plan.id,
          price: plan.price,
          quantity: 1,
          name: plan.name.substring(0, 45),
        },
      ],
    });

    const updatedPayment = await this.paymentTransactionRepository.update(
      payment.id,
      {
        snapToken: snapResponse.token,
        snapRedirectUrl: snapResponse.redirect_url,
        rawResponse: snapResponse as unknown as Record<string, unknown>,
      },
    );

    return {
      subscription,
      payment: updatedPayment,
    };
  }

  async processMidtransWebhook(
    notification: MidtransNotificationPayload,
    callbackToken?: string,
  ): Promise<{
    subscription: SubscriptionEntity;
    payment: PaymentTransactionEntity;
  }> {
    if (!this.midtransService.isCallbackTokenValid(callbackToken)) {
      throw new UnauthorizedException('Invalid callback token');
    }

    if (!this.midtransService.verifySignature(notification)) {
      throw new UnauthorizedException('Signature tidak valid');
    }

    const payment =
      await this.paymentTransactionRepository.findByMidtransOrderId(
        notification.order_id,
      );
    if (!payment) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    const subscription = await this.subscriptionRepository.findById(
      payment.subscriptionId,
    );
    if (!subscription) {
      throw new InternalServerErrorException(
        'Langganan tidak ditemukan untuk transaksi ini',
      );
    }

    const nextPaymentStatus = this.mapPaymentStatus(notification);
    const updatedPayment = await this.paymentTransactionRepository.update(
      payment.id,
      {
        status: nextPaymentStatus,
        paymentType: notification.payment_type ?? payment.paymentType,
        midtransTransactionId: notification.transaction_id,
        rawResponse: notification as unknown as Record<string, unknown>,
        paidAt: this.extractPaidAt(notification, payment.paidAt),
      },
    );

    const nextSubscriptionStatus = this.mapSubscriptionStatus(notification);
    const plan =
      subscription.plan ??
      (await this.subscriptionPlansService.getPlanById(subscription.planId));

    if (!plan) {
      throw new InternalServerErrorException('Paket langganan tidak ditemukan');
    }

    const updatedSubscription = await this.subscriptionRepository.update(
      subscription.id,
      {
        status: nextSubscriptionStatus,
        ...(nextSubscriptionStatus === 'ACTIVE'
          ? {
              currentPeriodStart: updatedPayment.paidAt ?? new Date(),
              currentPeriodEnd: this.calculatePeriodEnd(
                updatedPayment.paidAt ?? new Date(),
                plan.billingPeriod,
              ),
            }
          : {}),
      },
    );

    return { subscription: updatedSubscription, payment: updatedPayment };
  }

  private calculatePeriodEnd(
    start: Date,
    billingPeriod: 'MONTHLY' | 'YEARLY',
  ): Date {
    const end = new Date(start);
    if (billingPeriod === 'MONTHLY') {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }
    return end;
  }

  private extractPaidAt(
    notification: MidtransNotificationPayload,
    fallback: Date | null,
  ): Date | null {
    if (notification.settlement_time) {
      const settled = new Date(notification.settlement_time);
      if (!Number.isNaN(settled.getTime())) {
        return settled;
      }
    }

    if (
      notification.transaction_status === 'capture' ||
      notification.transaction_status === 'settlement'
    ) {
      return fallback ?? new Date();
    }

    return fallback;
  }

  private mapPaymentStatus(
    notification: MidtransNotificationPayload,
  ): PaymentStatus {
    switch (notification.transaction_status) {
      case 'capture':
        if (notification.fraud_status === 'challenge') {
          return 'PENDING';
        }
        if (
          notification.fraud_status &&
          notification.fraud_status !== 'accept'
        ) {
          return 'FAILED';
        }
        return 'SUCCESS';
      case 'settlement':
        return 'SUCCESS';
      case 'pending':
        return 'PENDING';
      case 'deny':
        return 'FAILED';
      case 'cancel':
        return 'CANCELED';
      case 'expire':
        return 'EXPIRED';
      default:
        return 'FAILED';
    }
  }

  private mapSubscriptionStatus(
    notification: MidtransNotificationPayload,
  ): SubscriptionEntity['status'] {
    switch (notification.transaction_status) {
      case 'capture':
      case 'settlement':
        if (notification.fraud_status === 'challenge') {
          return 'PENDING';
        }
        if (
          notification.fraud_status &&
          notification.fraud_status !== 'accept'
        ) {
          return 'CANCELED';
        }
        return 'ACTIVE';
      case 'pending':
        return 'PENDING';
      case 'cancel':
      case 'deny':
        return 'CANCELED';
      case 'expire':
        return 'EXPIRED';
      default:
        return 'CANCELED';
    }
  }

  private generateOrderId(subscriptionId: string): string {
    const timestamp = Date.now();
    return `SUB-${subscriptionId}-${timestamp}`;
  }
}
