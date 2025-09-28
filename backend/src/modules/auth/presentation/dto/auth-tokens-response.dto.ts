import { Tokens } from '../../domain/interfaces/tokens.interface';

export class AuthTokensResponseDto implements Tokens {
  accessToken: string;
  refreshToken: string;

  constructor(tokens: Tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}
