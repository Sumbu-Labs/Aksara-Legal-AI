import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
  DEFAULT_BCRYPT_SALT,
  DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
  USER_REPOSITORY,
} from '../../common/auth.constants';
import { User } from '../../domain/entities/user.entity';
import { AuthenticatedUser } from '../../domain/interfaces/authenticated-user.interface';
import {
  AccessTokenPayload,
  BaseJwtPayload,
} from '../../domain/interfaces/jwt-payload.interface';
import { Tokens } from '../../domain/interfaces/tokens.interface';
import { UserRepository } from '../../domain/repositories/user.repository';
import { NotificationsService } from '../../../notifications/application/services/notifications.service';
import { NotificationType } from '../../../notifications/domain/enums/notification-type.enum';

export interface RegisterCommand {
  name: string;
  email: string;
  password: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(command: RegisterCommand): Promise<Tokens> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hash(command.password);
    const user = User.create({
      name: command.name,
      email: command.email,
      passwordHash,
    });

    const tokens = await this.generateTokens(user);
    const refreshTokenHash = await this.hash(tokens.refreshToken);
    user.updateRefreshTokenHash(refreshTokenHash);

    await this.userRepository.save(user);

    await this.safeNotifyAccountRegistered(user.id, user.name);

    return tokens;
  }

  async login(command: LoginCommand): Promise<Tokens> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      command.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    user.updateRefreshTokenHash(await this.hash(tokens.refreshToken));
    await this.userRepository.save(user);

    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user);
    user.updateRefreshTokenHash(await this.hash(tokens.refreshToken));
    await this.userRepository.save(user);

    return tokens;
  }

  async clearRefreshToken(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return;
    }

    user.clearRefreshToken();
    await this.userRepository.save(user);
  }

  async validateUser(payload: BaseJwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token validation failed');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      tokenType: 'access',
    };

    const refreshPayload: BaseJwtPayload = {
      sub: user.id,
      email: user.email,
      tokenType: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.getAccessTokenSecret(),
        expiresIn: this.getAccessTokenExpiry(),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.getRefreshTokenSecret(),
        expiresIn: this.getRefreshTokenExpiry(),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async hash(data: string): Promise<string> {
    const configured = this.configService.get<string>('BCRYPT_SALT_ROUNDS');
    const saltRounds = configured
      ? Number.parseInt(configured, 10)
      : DEFAULT_BCRYPT_SALT;
    return bcrypt.hash(
      data,
      Number.isNaN(saltRounds) ? DEFAULT_BCRYPT_SALT : saltRounds,
    );
  }

  private getAccessTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      'default-access-secret'
    );
  }

  private getRefreshTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ??
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'default-refresh-secret'
    );
  }

  private getAccessTokenExpiry(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ??
      this.configService.get<string>('JWT_EXPIRATION_TIME') ??
      DEFAULT_ACCESS_TOKEN_EXPIRES_IN
    );
  }

  private getRefreshTokenExpiry(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ??
      this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME') ??
      DEFAULT_REFRESH_TOKEN_EXPIRES_IN
    );
  }

  private async safeNotifyAccountRegistered(
    userId: string,
    name: string,
  ): Promise<void> {
    try {
      await this.notificationsService.createNotification({
        userId,
        type: NotificationType.ACCOUNT_REGISTERED,
        title: 'Selamat datang di Aksara Legal AI!',
        message: `Halo ${name}, akun Anda berhasil dibuat. Lengkapi profil bisnis untuk memulai checklist izin.`,
        sendEmail: true,
      });
    } catch (error) {
      // swallow notification errors so registration still succeeds
    }
  }
}
