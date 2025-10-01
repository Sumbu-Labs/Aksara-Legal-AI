import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  DOCUMENT_REPOSITORY,
  DOCUMENT_VERSION_REPOSITORY,
} from './common/document.constants';
import { DocumentQuotaService } from './application/services/document-quota.service';
import { DocumentsService } from './application/services/documents.service';
import { PrismaDocumentRepository } from './infrastructure/repositories/prisma-document.repository';
import { PrismaDocumentVersionRepository } from './infrastructure/repositories/prisma-document-version.repository';
import { DocumentsController } from './presentation/controllers/documents.controller';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    NotificationsModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const maxSizeMb = Number(
          configService.get('DOCUMENT_UPLOAD_MAX_SIZE_MB') ?? 25,
        );
        return {
          storage: memoryStorage(),
          limits: {
            fileSize: maxSizeMb * 1024 * 1024,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentQuotaService,
    { provide: DOCUMENT_REPOSITORY, useClass: PrismaDocumentRepository },
    {
      provide: DOCUMENT_VERSION_REPOSITORY,
      useClass: PrismaDocumentVersionRepository,
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
