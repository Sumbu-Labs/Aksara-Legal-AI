import { randomUUID } from 'crypto';

type Nullable<T> = T | null | undefined;

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserParams {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  refreshTokenHash?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(params: CreateUserParams): User {
    const now = new Date();
    return new User({
      id: params.id ?? randomUUID(),
      name: params.name,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      refreshTokenHash: params.refreshTokenHash ?? null,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get refreshTokenHash(): Nullable<string> {
    return this.props.refreshTokenHash ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updatePasswordHash(passwordHash: string): void {
    this.props.passwordHash = passwordHash;
    this.touch();
  }

  updateRefreshTokenHash(refreshTokenHash: Nullable<string>): void {
    this.props.refreshTokenHash = refreshTokenHash ?? null;
    this.touch();
  }

  clearRefreshToken(): void {
    this.updateRefreshTokenHash(null);
  }

  toJSON(): UserProps {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
