import { ApiProperty } from '@nestjs/swagger';
import { Tokens } from '../../domain/interfaces/tokens.interface';

export class AuthTokensResponseDto implements Tokens {
  @ApiProperty({ description: 'JWT access token signed with access secret' })
  accessToken: string;
  @ApiProperty({ description: 'JWT refresh token signed with refresh secret' })
  refreshToken: string;

  constructor(tokens: Tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}
