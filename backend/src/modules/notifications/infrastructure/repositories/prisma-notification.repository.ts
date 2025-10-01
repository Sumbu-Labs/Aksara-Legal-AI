import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationEmailStatus } from '../../domain/enums/notification-email-status.enum';
import { NotificationStatus as DomainNotificationStatus } from '../../domain/enums/notification-status.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationMapper } from '../mappers/notification.mapper';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(notification: Notification): Promise<void> {
    const data = notification.toJSON();
    await this.prisma.notification.create({
      data: {
        id: data.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        payload: this.toJsonValue(data.payload),
        status: this.toPrismaNotificationStatus(data.status),
        readAt: data.readAt,
        sentAt: data.sentAt,
        emailStatus: this.toPrismaNotificationEmailStatus(data.emailStatus),
        emailSentAt: data.emailSentAt,
        emailError: data.emailError,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async save(notification: Notification): Promise<void> {
    const data = notification.toJSON();
    await this.prisma.notification.update({
      where: { id: data.id },
      data: {
        status: this.toPrismaNotificationStatus(data.status),
        readAt: data.readAt,
        emailStatus: this.toPrismaNotificationEmailStatus(data.emailStatus),
        emailSentAt: data.emailSentAt,
        emailError: data.emailError,
        updatedAt: data.updatedAt,
        payload: this.toJsonValue(data.payload),
      },
    });
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Notification | null> {
    const record = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    return record ? NotificationMapper.toDomain(record) : null;
  }

  async listByUser(
    userId: string,
    options: {
      status?: DomainNotificationStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({
      where: {
        userId,
        status: this.toPrismaNotificationStatus(options.status),
      },
      orderBy: { createdAt: 'desc' },
      skip: options.skip,
      take: options.take,
    });
    return records.map((record) => NotificationMapper.toDomain(record));
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        status: this.toPrismaNotificationStatus(
          DomainNotificationStatus.UNREAD,
        ),
      },
      data: {
        status: this.toPrismaNotificationStatus(DomainNotificationStatus.READ),
        readAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return result.count;
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  private toJsonValue(
    payload: Record<string, unknown> | null | undefined,
  ) {
    if (payload === undefined) {
      return undefined;
    }

    if (payload === null) {
      return null;
    }

    return payload;
  }

  private toPrismaNotificationStatus(
    status: DomainNotificationStatus | undefined,
  ) {
    if (status === undefined) {
      return undefined;
    }

    return status;
  }

  private toPrismaNotificationEmailStatus(
    status: NotificationEmailStatus,
  ) {
    return status;
  }
}
