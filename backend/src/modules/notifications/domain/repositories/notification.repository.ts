import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';

export interface NotificationRepository {
  create(notification: Notification): Promise<void>;
  save(notification: Notification): Promise<void>;
  findByIdForUser(id: string, userId: string): Promise<Notification | null>;
  listByUser(
    userId: string,
    options: { status?: NotificationStatus; skip?: number; take?: number },
  ): Promise<Notification[]>;
  markAllAsRead(userId: string): Promise<number>;
  delete(notificationId: string, userId: string): Promise<void>;
}
