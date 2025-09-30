import { Injectable } from '@nestjs/common';
import { NotificationStatus, Prisma } from '@prisma/client';
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
        type: data.type as NotificationType,
        title: data.title,
        message: data.message,
        payload: this.toJsonValue(data.payload),
        status: data.status as DomainNotificationStatus,
        readAt: data.readAt,
        sentAt: data.sentAt,
        emailStatus: data.emailStatus as NotificationEmailStatus,
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
        status: data.status as DomainNotificationStatus,
        readAt: data.readAt,
        emailStatus: data.emailStatus as NotificationEmailStatus,
        emailSentAt: data.emailSentAt,
        emailError: data.emailError,
        updatedAt: data.updatedAt,
        payload: this.toJsonValue(data.payload),
      },
    });
  }

  async findByIdForUser(id: string, userId: string): Promise<Notification | null> {
    const record = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    return record ? NotificationMapper.toDomain(record) : null;
  }

  async listByUser(
    userId: string,
    options: { status?: DomainNotificationStatus; skip?: number; take?: number },
  ): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({
      where: {
        userId,
        status: options.status as NotificationStatus | undefined,
      },
      orderBy: { createdAt: 'desc' },
      skip: options.skip,
      take: options.take,
    });
    return records.map(NotificationMapper.toDomain);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, status: NotificationStatus.UNREAD },
      data: { status: NotificationStatus.READ, readAt: new Date(), updatedAt: new Date() },
    });
    return result.count;
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  private toJsonValue(payload: Record<string, unknown> | null | undefined): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull | undefined {
    if (payload === null) {
      return Prisma.JsonNull;
    }
    if (payload === undefined) {
      return undefined;
    }
    return payload as Prisma.InputJsonValue;
  }
}
