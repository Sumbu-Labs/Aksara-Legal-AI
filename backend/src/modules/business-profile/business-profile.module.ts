import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BusinessProfileService } from './application/services/business-profile.service';
import {
  BUSINESS_PERMIT_PROFILE_REPOSITORY,
  BUSINESS_PROFILE_REPOSITORY,
} from './common/business-profile.constants';
import { BusinessProfileController } from './presentation/controllers/business-profile.controller';
import { PrismaBusinessProfileRepository } from './infrastructure/repositories/prisma-business-profile.repository';
import { PrismaBusinessPermitProfileRepository } from './infrastructure/repositories/prisma-business-permit-profile.repository';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [BusinessProfileController],
  providers: [
    BusinessProfileService,
    {
      provide: BUSINESS_PROFILE_REPOSITORY,
      useClass: PrismaBusinessProfileRepository,
    },
    {
      provide: BUSINESS_PERMIT_PROFILE_REPOSITORY,
      useClass: PrismaBusinessPermitProfileRepository,
    },
  ],
  exports: [BusinessProfileService],
})
export class BusinessProfileModule {}
