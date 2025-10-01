import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionEntity } from '../../domain/repositories/subscription.repository';
import { SubscriptionPlanResponseDto } from './subscription-plan-response.dto';

export class SubscriptionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  planId!: string;

  @ApiProperty({ enum: ['PENDING', 'ACTIVE', 'CANCELED', 'EXPIRED'] })
  status!: SubscriptionEntity['status'];

  @ApiProperty({ type: Date, nullable: true })
  currentPeriodStart!: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  currentPeriodEnd!: Date | null;

  @ApiProperty({ default: false })
  cancelAtPeriodEnd!: boolean;

  @ApiProperty({ required: false, nullable: true })
  midtransSubscriptionId!: string | null;

  @ApiProperty({ type: () => SubscriptionPlanResponseDto, required: false })
  plan?: SubscriptionPlanResponseDto;

  static fromEntity(entity: SubscriptionEntity): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto();
    dto.id = entity.id;
    dto.planId = entity.planId;
    dto.status = entity.status;
    dto.currentPeriodStart = entity.currentPeriodStart;
    dto.currentPeriodEnd = entity.currentPeriodEnd;
    dto.cancelAtPeriodEnd = entity.cancelAtPeriodEnd;
    dto.midtransSubscriptionId = entity.midtransSubscriptionId;
    dto.plan = entity.plan
      ? SubscriptionPlanResponseDto.fromEntity(entity.plan)
      : undefined;
    return dto;
  }
}
