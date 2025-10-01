import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { DemoUserService } from './application/services/demo-user.service';
import {
  USER_REPOSITORY,
  DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
} from './common/auth.constants';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtRefreshGuard } from './infrastructure/guards/jwt-refresh.guard';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    NotificationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ??
          configService.get<string>('JWT_SECRET') ??
          'default-access-secret',
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ??
            configService.get<string>('JWT_EXPIRATION_TIME') ??
            DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    DemoUserService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [AuthService, USER_REPOSITORY],
})
export class AuthModule {}
