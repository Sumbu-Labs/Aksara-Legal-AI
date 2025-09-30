import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationEmailStatus } from '../../domain/enums/notification-email-status.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';

type Nullable<T> = T | null | undefined;

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false, nullable: true, type: Object, additionalProperties: true })
  payload: Nullable<Record<string, unknown>>;

  @ApiProperty({ enum: NotificationStatus })
  status: NotificationStatus;

  @ApiProperty({ required: false, nullable: true })
  readAt: Nullable<Date>;

  @ApiProperty()
  sentAt: Date;

  @ApiProperty({ enum: NotificationEmailStatus })
  emailStatus: NotificationEmailStatus;

  @ApiProperty({ required: false, nullable: true })
  emailSentAt: Nullable<Date>;

  @ApiProperty({ required: false, nullable: true })
  emailError: Nullable<string>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      payload: notification.payload,
      status: notification.status,
      readAt: notification.readAt,
      sentAt: notification.sentAt,
      emailStatus: notification.emailStatus,
      emailSentAt: notification.emailSentAt,
      emailError: notification.emailError,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
