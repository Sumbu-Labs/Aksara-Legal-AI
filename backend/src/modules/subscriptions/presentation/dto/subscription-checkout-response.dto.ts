import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionResponseDto } from './subscription-response.dto';
import { PaymentTransactionResponseDto } from './payment-transaction-response.dto';
import { SubscriptionCheckoutResult } from '../../application/services/subscriptions.service';

export class SubscriptionCheckoutResponseDto {
  @ApiProperty({ type: () => SubscriptionResponseDto })
  subscription!: SubscriptionResponseDto;

  @ApiProperty({ type: () => PaymentTransactionResponseDto })
  payment!: PaymentTransactionResponseDto;

  static fromResult(result: SubscriptionCheckoutResult): SubscriptionCheckoutResponseDto {
    const dto = new SubscriptionCheckoutResponseDto();
    dto.subscription = SubscriptionResponseDto.fromEntity(result.subscription);
    dto.payment = PaymentTransactionResponseDto.fromEntity(result.payment);
    return dto;
  }
}
