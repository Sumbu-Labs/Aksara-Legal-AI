import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { USER_REPOSITORY } from '../../common/auth.constants';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class DemoUserService implements OnModuleInit {
  private readonly logger = new Logger(DemoUserService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.isBypassEnabled()) {
      return;
    }

    const id = this.configService.get<string>('DEMO_USER_ID') ?? 'demo-user';
    const email =
      this.configService.get<string>('DEMO_USER_EMAIL') ?? 'demo@aksara.id';
    const name =
      this.configService.get<string>('DEMO_USER_NAME') ?? 'Aksara Demo';
    const passwordHash =
      this.configService.get<string>('DEMO_USER_PASSWORD_HASH') ??
      this.generatePlaceholderHash(id, email);

    const existing = await this.userRepository.findById(id);
    if (existing) {
      return;
    }

    const collision = await this.userRepository.findByEmail(email);
    if (collision && collision.id !== id) {
      this.logger.warn(
        `Demo user email ${email} is already used by another account (${collision.id}). Auth bypass may not work as expected.`,
      );
      return;
    }

    try {
      const user = User.create({ id, name, email, passwordHash });
      await this.userRepository.save(user);
      this.logger.log(
        `Demo user ${email} (${id}) provisioned for auth bypass.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Failed to provision demo user ${email} (${id}): ${message}`,
      );
    }
  }

  private isBypassEnabled(): boolean {
    const raw = this.configService.get<string>('AUTH_BYPASS_ENABLED');
    if (raw === undefined || raw === null) {
      return true;
    }
    return raw === '1' || raw.toLowerCase() === 'true';
  }

  private generatePlaceholderHash(id: string, email: string): string {
    return createHash('sha256')
      .update(`aksara-demo:${id}:${email}`)
      .digest('hex');
  }
}
