import { randomUUID } from 'crypto';
import { NotificationEmailStatus } from '../enums/notification-email-status.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';

type Nullable<T> = T | null | undefined;

export interface NotificationProps {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown> | null;
  status: NotificationStatus;
  readAt?: Date | null;
  sentAt: Date;
  emailStatus: NotificationEmailStatus;
  emailSentAt?: Date | null;
  emailError?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationParams {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown> | null;
  status?: NotificationStatus;
  readAt?: Date | null;
  sentAt?: Date;
  emailStatus?: NotificationEmailStatus;
  emailSentAt?: Date | null;
  emailError?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notification {
  private constructor(private props: NotificationProps) {}

  static create(params: CreateNotificationParams): Notification {
    const now = new Date();
    return new Notification({
      id: params.id ?? randomUUID(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      payload: params.payload ?? null,
      status: params.status ?? NotificationStatus.UNREAD,
      readAt: params.readAt ?? null,
      sentAt: params.sentAt ?? now,
      emailStatus: params.emailStatus ?? NotificationEmailStatus.PENDING,
      emailSentAt: params.emailSentAt ?? null,
      emailError: params.emailError ?? null,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string {
    return this.props.message;
  }

  get payload(): Nullable<Record<string, unknown>> {
    return this.props.payload ?? null;
  }

  get status(): NotificationStatus {
    return this.props.status;
  }

  get readAt(): Nullable<Date> {
    return this.props.readAt ?? null;
  }

  get sentAt(): Date {
    return this.props.sentAt;
  }

  get emailStatus(): NotificationEmailStatus {
    return this.props.emailStatus;
  }

  get emailSentAt(): Nullable<Date> {
    return this.props.emailSentAt ?? null;
  }

  get emailError(): Nullable<string> {
    return this.props.emailError ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  markRead(): void {
    if (this.props.status === NotificationStatus.READ) {
      return;
    }
    this.props.status = NotificationStatus.READ;
    this.props.readAt = new Date();
    this.touch();
  }

  updateEmailStatus(
    status: NotificationEmailStatus,
    details?: { sentAt?: Date; error?: string | null },
  ): void {
    this.props.emailStatus = status;
    if (status === NotificationEmailStatus.SENT) {
      this.props.emailSentAt = details?.sentAt ?? new Date();
      this.props.emailError = null;
    } else if (status === NotificationEmailStatus.FAILED) {
      this.props.emailSentAt = details?.sentAt ?? null;
      this.props.emailError = details?.error ?? null;
    } else if (status === NotificationEmailStatus.SKIPPED) {
      this.props.emailSentAt = null;
      this.props.emailError = null;
    }
    this.touch();
  }

  toJSON(): NotificationProps {
    return { ...this.props };
  }

  private touch(date: Date = new Date()): void {
    this.props.updatedAt = date;
  }
}
