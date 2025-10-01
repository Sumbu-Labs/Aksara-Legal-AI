import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlanEntity } from '../../domain/repositories/subscription-plan.repository';

export class SubscriptionPlanResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'] })
  billingPeriod!: 'MONTHLY' | 'YEARLY';

  @ApiProperty({ required: false, nullable: true, type: Object })
  metadata!: Record<string, unknown> | null;

  static fromEntity(entity: SubscriptionPlanEntity): SubscriptionPlanResponseDto {
    const dto = new SubscriptionPlanResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.price = entity.price;
    dto.currency = entity.currency;
    dto.billingPeriod = entity.billingPeriod;
    dto.metadata = entity.metadata;
    return dto;
  }
}
