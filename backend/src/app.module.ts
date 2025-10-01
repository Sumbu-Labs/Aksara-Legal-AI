import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessProfileModule } from './modules/business-profile/business-profile.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DocsModule } from './docs/docs.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    BusinessProfileModule,
    DocumentsModule,
    AssistantModule,
    MailModule,
    NotificationsModule,
    SubscriptionsModule,
    DocsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
