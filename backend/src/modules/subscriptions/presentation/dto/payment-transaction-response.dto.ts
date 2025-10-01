import { ApiProperty } from '@nestjs/swagger';
import { PaymentTransactionEntity } from '../../domain/repositories/payment-transaction.repository';

export class PaymentTransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty({
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELED', 'EXPIRED'],
  })
  status!: PaymentTransactionEntity['status'];

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ required: false, nullable: true })
  paymentType!: string | null;

  @ApiProperty()
  midtransOrderId!: string;

  @ApiProperty({ required: false, nullable: true })
  midtransTransactionId!: string | null;

  @ApiProperty({ required: false, nullable: true })
  snapToken!: string | null;

  @ApiProperty({ required: false, nullable: true })
  snapRedirectUrl!: string | null;

  @ApiProperty({ type: Date, required: false, nullable: true })
  paidAt!: Date | null;

  static fromEntity(
    entity: PaymentTransactionEntity,
  ): PaymentTransactionResponseDto {
    const dto = new PaymentTransactionResponseDto();
    dto.id = entity.id;
    dto.subscriptionId = entity.subscriptionId;
    dto.status = entity.status;
    dto.amount = entity.amount;
    dto.currency = entity.currency;
    dto.paymentType = entity.paymentType;
    dto.midtransOrderId = entity.midtransOrderId;
    dto.midtransTransactionId = entity.midtransTransactionId;
    dto.snapToken = entity.snapToken;
    dto.snapRedirectUrl = entity.snapRedirectUrl;
    dto.paidAt = entity.paidAt;
    return dto;
  }
}
