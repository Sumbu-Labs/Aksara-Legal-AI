import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionPlansService } from './application/services/subscription-plans.service';
import { SubscriptionsService } from './application/services/subscriptions.service';
import {
  SUBSCRIPTION_PLAN_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
  PAYMENT_TRANSACTION_REPOSITORY,
} from './common/subscription.constants';
import { PrismaSubscriptionPlanRepository } from './infrastructure/repositories/prisma-subscription-plan.repository';
import { PrismaSubscriptionRepository } from './infrastructure/repositories/prisma-subscription.repository';
import { PrismaPaymentTransactionRepository } from './infrastructure/repositories/prisma-payment-transaction.repository';
import { MidtransService } from './infrastructure/midtrans/midtrans.service';
import { SubscriptionsController } from './presentation/controllers/subscriptions.controller';
import { SubscriptionsWebhookController } from './presentation/controllers/subscriptions-webhook.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [SubscriptionsController, SubscriptionsWebhookController],
  providers: [
    SubscriptionPlansService,
    SubscriptionsService,
    MidtransService,
    {
      provide: SUBSCRIPTION_PLAN_REPOSITORY,
      useClass: PrismaSubscriptionPlanRepository,
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: PAYMENT_TRANSACTION_REPOSITORY,
      useClass: PrismaPaymentTransactionRepository,
    },
  ],
  exports: [SubscriptionsService, SubscriptionPlansService],
})
export class SubscriptionsModule {}
