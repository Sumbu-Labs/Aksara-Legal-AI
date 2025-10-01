import { ApiProperty } from '@nestjs/swagger';
import { AuthSession } from '../../domain/interfaces/auth-session.interface';
import { AuthenticatedUserDto } from './authenticated-user.dto';

export class AuthTokensResponseDto implements AuthSession {
  @ApiProperty({ description: 'JWT access token signed with access secret' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token signed with refresh secret' })
  refreshToken: string;

  @ApiProperty({ description: 'Authenticated user payload', type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;

  constructor(session: AuthSession) {
    this.accessToken = session.accessToken;
    this.refreshToken = session.refreshToken;
    this.user = new AuthenticatedUserDto(session.user);
  }
}
