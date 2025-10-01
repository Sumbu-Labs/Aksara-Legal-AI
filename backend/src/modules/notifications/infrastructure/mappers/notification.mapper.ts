import { Notification } from '../../domain/entities/notification.entity';
import { NotificationEmailStatus } from '../../domain/enums/notification-email-status.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';

type PrismaNotificationRecord = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: unknown;
  status: NotificationStatus;
  readAt: Date | null;
  sentAt: Date;
  emailStatus: NotificationEmailStatus;
  emailSentAt: Date | null;
  emailError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class NotificationMapper {
  static toDomain(record: PrismaNotificationRecord): Notification {
    return Notification.create({
      id: record.id,
      userId: record.userId,
      type: record.type,
      title: record.title,
      message: record.message,
      payload: (record.payload as Record<string, unknown> | null) ?? null,
      status: record.status,
      readAt: record.readAt,
      sentAt: record.sentAt,
      emailStatus: record.emailStatus,
      emailSentAt: record.emailSentAt,
      emailError: record.emailError,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
