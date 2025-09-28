export interface BaseJwtPayload {
  sub: string;
  email: string;
  tokenType: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AccessTokenPayload extends BaseJwtPayload {
  tokenType: 'access';
}

export interface RefreshTokenPayload extends BaseJwtPayload {
  tokenType: 'refresh';
}
