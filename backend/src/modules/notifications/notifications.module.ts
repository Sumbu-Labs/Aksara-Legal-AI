import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { MailModule } from '../../infrastructure/mail/mail.module';
import { NOTIFICATION_REPOSITORY } from './common/notification.constants';
import { NotificationsService } from './application/services/notifications.service';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';
import { NotificationsController } from './presentation/controllers/notifications.controller';

@Module({
  imports: [ConfigModule, PrismaModule, MailModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
