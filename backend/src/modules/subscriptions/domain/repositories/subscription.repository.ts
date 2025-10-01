import type { SubscriptionPlanEntity } from './subscription-plan.repository';

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'CANCELED' | 'EXPIRED';

export type SubscriptionEntity = {
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
  plan?: SubscriptionPlanEntity;
};

export interface SubscriptionRepository {
  findActiveByUserId(userId: string): Promise<SubscriptionEntity | null>;
  findById(id: string): Promise<SubscriptionEntity | null>;
  create(subscription: Pick<
    SubscriptionEntity,
    'userId' | 'planId' | 'status' | 'cancelAtPeriodEnd' | 'currentPeriodStart' | 'currentPeriodEnd' | 'midtransSubscriptionId'
  >): Promise<SubscriptionEntity>;
  update(
    id: string,
    data: Partial<
      Pick<
        SubscriptionEntity,
        'status' | 'currentPeriodStart' | 'currentPeriodEnd' | 'cancelAtPeriodEnd' | 'midtransSubscriptionId'
      >
    >,
  ): Promise<SubscriptionEntity>;
}
