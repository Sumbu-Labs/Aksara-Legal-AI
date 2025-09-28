import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../../application/services/auth.service';
import { AccessTokenPayload } from '../../domain/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ??
        configService.get<string>('JWT_SECRET') ??
        'default-access-secret',
    });
  }

  async validate(payload: AccessTokenPayload) {
    return this.authService.validateUser(payload);
  }
}
