import { NotificationType } from '../../domain/enums/notification-type.enum';

export interface CreateNotificationCommand {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown> | null;
  sendEmail?: boolean;
  emailActionUrl?: string;
}
