import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../database/prisma.service';

interface UsageSummary {
  documentCount: number;
  storageBytes: bigint;
}

@Injectable()
export class DocumentQuotaService {
  private readonly maxDocuments: number;
  private readonly maxStorageBytes: bigint;

  constructor(private readonly prisma: PrismaService, configService: ConfigService) {
    this.maxDocuments = Number(configService.get('DOCUMENT_MAX_TOTAL_FILES') ?? 200);
    const sizeMb = Number(configService.get('DOCUMENT_MAX_TOTAL_SIZE_MB') ?? 500);
    this.maxStorageBytes = BigInt(sizeMb) * BigInt(1024 * 1024);
  }

  async ensureCanUpload(
    userId: string,
    files: { size: number }[],
    options?: { additionalDocuments?: number },
  ): Promise<void> {
    const additionalDocuments = options?.additionalDocuments ?? files.length;
    const additionalBytes = files.reduce((acc, file) => acc + BigInt(file.size), BigInt(0));
    await this.ensureCapacity(userId, additionalDocuments, additionalBytes);
  }

  private async readUsage(userId: string): Promise<UsageSummary> {
    const [documentCount, storage] = await this.prisma.$transaction([
      this.prisma.document.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),
      this.prisma.documentVersion.aggregate({
        _sum: { size: true },
        where: {
          document: {
            userId,
            deletedAt: null,
          },
        },
      }),
    ]);

    const storageBytes = storage._sum.size ?? null;

    return {
      documentCount,
      storageBytes: storageBytes !== null ? storageBytes : BigInt(0),
    };
  }

  private async ensureCapacity(userId: string, additionalDocuments: number, additionalBytes: bigint): Promise<void> {
    const usage = await this.readUsage(userId);
    if (usage.documentCount + additionalDocuments > this.maxDocuments) {
      throw new BadRequestException('Document limit exceeded for your plan');
    }

    if (usage.storageBytes + additionalBytes > this.maxStorageBytes) {
      throw new BadRequestException('Storage limit exceeded for your plan');
    }
  }
}
