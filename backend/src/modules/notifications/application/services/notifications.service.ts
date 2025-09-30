import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../../../../infrastructure/mail/mail.service';
import { PrismaService } from '../../../../database/prisma.service';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationEmailStatus } from '../../domain/enums/notification-email-status.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NOTIFICATION_REPOSITORY } from '../../common/notification.constants';
import { CreateNotificationCommand } from '../dto/create-notification.command';

export interface ListNotificationsOptions {
  status?: NotificationStatus;
  skip?: number;
  take?: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async createNotification(command: CreateNotificationCommand): Promise<Notification> {
    const notification = Notification.create({
      userId: command.userId,
      type: command.type,
      title: command.title,
      message: command.message,
      payload: command.payload ?? null,
      emailStatus: command.sendEmail ? NotificationEmailStatus.PENDING : NotificationEmailStatus.SKIPPED,
    });

    await this.notificationRepository.create(notification);

    if (command.sendEmail) {
      const result = await this.mailService.sendNotificationEmail({
        to: await this.resolveUserEmail(command.userId),
        title: command.title,
        message: command.message,
        actionUrl: command.emailActionUrl,
      });

      if (result.status === 'SENT') {
        notification.updateEmailStatus(NotificationEmailStatus.SENT, { sentAt: new Date() });
      } else if (result.status === 'FAILED') {
        notification.updateEmailStatus(NotificationEmailStatus.FAILED, { error: result.error ?? 'Unknown error' });
      } else {
        notification.updateEmailStatus(NotificationEmailStatus.SKIPPED);
      }

      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  async listNotifications(userId: string, options: ListNotificationsOptions): Promise<Notification[]> {
    const defaults = {
      skip: options.skip ?? 0,
      take: options.take ?? 20,
    };
    return this.notificationRepository.listByUser(userId, {
      status: options.status,
      ...defaults,
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.markRead();
    await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.notificationRepository.delete(notificationId, userId);
  }

  /**
   * Placeholder resolver – ideally user email diambil via repository khusus.
   * Untuk sementara, notification akan menggunakan email dari user entity.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async resolveUserEmail(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found for notification email');
    }
    return user.email;
  }
}
