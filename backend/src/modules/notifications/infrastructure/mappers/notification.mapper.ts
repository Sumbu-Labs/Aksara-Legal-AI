import { Notification } from '../../domain/entities/notification.entity';
import { NotificationEmailStatus } from '../../domain/enums/notification-email-status.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';

type PrismaNotificationRecord = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  payload: unknown;
  status: string;
  readAt: Date | null;
  sentAt: Date;
  emailStatus: string;
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
      type: this.mapType(record.type),
      title: record.title,
      message: record.message,
      payload: this.mapPayload(record.payload),
      status: this.mapStatus(record.status),
      readAt: record.readAt,
      sentAt: record.sentAt,
      emailStatus: this.mapEmailStatus(record.emailStatus),
      emailSentAt: record.emailSentAt,
      emailError: record.emailError,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private static mapPayload(
    payload: unknown,
  ): Record<string, unknown> | null {
    if (payload === null || payload === undefined) {
      return null;
    }

    if (typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }

    return { value: payload as unknown };
  }

  private static mapType(type: string): NotificationType {
    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      throw new Error(`Unexpected notification type received from database: ${type}`);
    }

    return type as NotificationType;
  }

  private static mapStatus(
    status: string,
  ): NotificationStatus {
    if (!Object.values(NotificationStatus).includes(status as NotificationStatus)) {
      throw new Error(
        `Unexpected notification status received from database: ${status}`,
      );
    }

    return status as NotificationStatus;
  }

  private static mapEmailStatus(
    status: string,
  ): NotificationEmailStatus {
    if (
      !Object.values(NotificationEmailStatus).includes(
        status as NotificationEmailStatus,
      )
    ) {
      throw new Error(
        `Unexpected notification email status received from database: ${status}`,
      );
    }

    return status as NotificationEmailStatus;
  }
}
