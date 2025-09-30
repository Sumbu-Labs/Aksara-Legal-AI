import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessProfileModule } from './modules/business-profile/business-profile.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DocsModule } from './docs/docs.module';
import { MailModule } from './infrastructure/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    BusinessProfileModule,
    DocumentsModule,
    MailModule,
    NotificationsModule,
    DocsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
