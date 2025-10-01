import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../domain/interfaces/authenticated-user.interface';

type RequestWithUser = {
  user?: AuthenticatedUser;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isBypassEnabled()) {
      this.attachDemoUser(context);
      return true;
    }
    return (await super.canActivate(context)) as boolean;
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: TUser | undefined,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (this.isBypassEnabled()) {
      if (user) {
        return user;
      }
      return this.attachDemoUser(context) as unknown as TUser;
    }

    if (err || !user) {
      throw (
        (err as UnauthorizedException) ??
        new UnauthorizedException('Authentication required')
      );
    }
    return user;
  }

  private isBypassEnabled(): boolean {
    const raw = this.configService.get<string>('AUTH_BYPASS_ENABLED');
    if (raw === undefined || raw === null) {
      return true;
    }
    return raw === '1' || raw.toLowerCase() === 'true';
  }

  private attachDemoUser(context: ExecutionContext): AuthenticatedUser {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.user) {
      return request.user;
    }
    const user = this.createDemoUser();
    request.user = user;
    return user;
  }

  private createDemoUser(): AuthenticatedUser {
    const id = this.configService.get<string>('DEMO_USER_ID') ?? 'demo-user';
    const email =
      this.configService.get<string>('DEMO_USER_EMAIL') ?? 'demo@aksara.id';
    const name =
      this.configService.get<string>('DEMO_USER_NAME') ?? 'Aksara Demo';
    return { id, email, name } satisfies AuthenticatedUser;
  }
}
