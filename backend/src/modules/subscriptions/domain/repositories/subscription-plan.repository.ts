export type SubscriptionPlanEntity = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface SubscriptionPlanRepository {
  findActive(): Promise<SubscriptionPlanEntity[]>;
  findById(id: string): Promise<SubscriptionPlanEntity | null>;
}
