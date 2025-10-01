import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

export interface NotificationEmailPayload {
  to: string;
  title: string;
  message: string;
  actionUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly enabled: boolean;

  constructor(
    private readonly mailer: MailerService,
    configService: ConfigService,
  ) {
    this.enabled =
      (
        configService.get<string>('ENABLE_EMAIL_NOTIFICATIONS') ?? 'false'
      ).toLowerCase() === 'true';
  }

  async sendNotificationEmail(
    payload: NotificationEmailPayload,
  ): Promise<{ status: 'SENT' | 'SKIPPED' | 'FAILED'; error?: string }> {
    if (!this.enabled) {
      return { status: 'SKIPPED' };
    }

    try {
      await this.mailer.sendMail({
        to: payload.to,
        subject: payload.title,
        template: 'notification',
        context: {
          title: payload.title,
          message: payload.message,
          actionUrl: payload.actionUrl,
        },
      });
      return { status: 'SENT' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to send notification email to ${payload.to}`,
        err,
      );
      return { status: 'FAILED', error: err.message };
    }
  }
}
