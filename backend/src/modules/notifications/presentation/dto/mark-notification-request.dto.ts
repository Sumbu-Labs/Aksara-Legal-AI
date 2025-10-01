import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MarkNotificationRequestDto {
  @ApiProperty({
    description: 'ID notifikasi yang ingin ditandai sebagai dibaca',
  })
  @IsString()
  notificationId: string;
}

export class MarkAllNotificationRequestDto {
  @ApiPropertyOptional({
    description: 'opsional catatan/konteks',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
