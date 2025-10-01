import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MidtransWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  order_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gross_amount!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status_code!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_status!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  payment_type?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature_key!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  fraud_status?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  settlement_time?: string;
}
