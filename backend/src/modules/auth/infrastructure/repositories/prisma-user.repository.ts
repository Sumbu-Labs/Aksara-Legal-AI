import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async save(user: User): Promise<void> {
    const data = user.toJSON();
    await this.prisma.user.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        refreshTokenHash: data.refreshTokenHash ?? null,
      },
      update: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        refreshTokenHash: data.refreshTokenHash ?? null,
      },
    });
  }

  private toDomain(user: PrismaUser): User {
    return User.create({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      refreshTokenHash: user.refreshTokenHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
