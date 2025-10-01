import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionRequestDto {
  @ApiProperty({ description: 'ID paket langganan yang dipilih' })
  @IsString()
  @IsUUID()
  planId!: string;
}
