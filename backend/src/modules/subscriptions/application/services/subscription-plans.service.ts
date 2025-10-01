import { Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_PLAN_REPOSITORY } from '../../common/subscription.constants';
import {
  SubscriptionPlanEntity,
  SubscriptionPlanRepository,
} from '../../domain/repositories/subscription-plan.repository';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly plansRepository: SubscriptionPlanRepository,
  ) {}

  async listActivePlans(): Promise<SubscriptionPlanEntity[]> {
    return this.plansRepository.findActive();
  }

  async getPlanById(id: string): Promise<SubscriptionPlanEntity | null> {
    return this.plansRepository.findById(id);
  }
}
