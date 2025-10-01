import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../application/services/auth.service';
import { RefreshTokenPayload } from '../../domain/interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ??
        configService.get<string>('JWT_REFRESH_SECRET') ??
        'default-refresh-secret',
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: RefreshTokenPayload) {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const user = await this.authService.validateUser(payload);

    return {
      ...user,
      refreshToken,
    };
  }
}
