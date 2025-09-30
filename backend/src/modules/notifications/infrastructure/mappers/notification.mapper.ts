import { Notification as PrismaNotification } from '@prisma/client';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationEmailStatus } from '../../domain/enums/notification-email-status.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';

export class NotificationMapper {
  static toDomain(record: PrismaNotification): Notification {
    return Notification.create({
      id: record.id,
      userId: record.userId,
      type: record.type as NotificationType,
      title: record.title,
      message: record.message,
      payload: (record.payload as Record<string, unknown> | null) ?? null,
      status: record.status as NotificationStatus,
      readAt: record.readAt,
      sentAt: record.sentAt,
      emailStatus: record.emailStatus as NotificationEmailStatus,
      emailSentAt: record.emailSentAt,
      emailError: record.emailError,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
