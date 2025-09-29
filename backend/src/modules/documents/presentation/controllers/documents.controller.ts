import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/interfaces/authenticated-user.interface';
import { DocumentsService } from '../../application/services/documents.service';
import { DocumentResponseDto } from '../dto/document-response.dto';
import { DocumentVersionResponseDto } from '../dto/document-version-response.dto';
import { UploadDocumentRequestDto, BatchUploadDocumentRequestDto } from '../dto/upload-document.request.dto';
import { BatchUploadDocumentCommand } from '../../application/dto/upload-document.command';
import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Unggah satu dokumen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        businessProfileId: { type: 'string', nullable: true },
        permitType: { type: 'string', nullable: true, enum: ['HALAL', 'PIRT', 'BPOM'] },
        label: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        metadata: { type: 'string', nullable: true, description: 'JSON string' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UploadDocumentRequestDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const metadata = this.safeParseMetadata(body.metadata);
    const document = await this.documentsService.uploadDocument({
      userId: user.id,
      businessProfileId: body.businessProfileId ?? null,
      permitType: body.permitType ?? null,
      label: body.label ?? file.originalname,
      notes: body.notes ?? null,
      metadata,
      file,
    });

    const { document: hydrated, downloadUrl } = await this.documentsService.getDocument(user.id, document.id);
    return DocumentResponseDto.fromDomain(hydrated, downloadUrl);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Unggah beberapa dokumen sekaligus' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        metadata: {
          type: 'string',
          description: 'JSON array dengan metadata per dokumen',
        },
      },
      required: ['files'],
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ status: 201, type: [DocumentResponseDto] })
  async uploadDocumentsBatch(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: BatchUploadDocumentRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<DocumentResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const parsedMetadata = this.safeParseMetadataArray(body.metadata, files.length);

    const batchCommand: BatchUploadDocumentCommand = {
      userId: user.id,
      documents: files.map((file, index) => {
        const meta = parsedMetadata[index] as Record<string, unknown>;
        return {
          file,
          businessProfileId: this.coerceString(meta.businessProfileId),
          permitType: this.coercePermitType(meta.permitType),
          label: this.coerceString(meta.label) ?? file.originalname,
          notes: this.coerceString(meta.notes),
          metadata: this.coerceRecord(meta.metadata),
        };
      }),
    };

    const documents = await this.documentsService.uploadBatch(batchCommand);
    return Promise.all(
      documents.map(async (doc) => {
        const { document: hydrated, downloadUrl } = await this.documentsService.getDocument(user.id, doc.id);
        return DocumentResponseDto.fromDomain(hydrated, downloadUrl);
      }),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mengganti file dokumen dengan versi baru' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        label: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        metadata: { type: 'string', nullable: true },
        permitType: { type: 'string', nullable: true, enum: ['HALAL', 'PIRT', 'BPOM'] },
        businessProfileId: { type: 'string', nullable: true },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  async replaceDocument(
    @Param('id') documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UploadDocumentRequestDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const metadata = this.safeParseMetadata(body.metadata);
    const document = await this.documentsService.replaceDocument({
      documentId,
      userId: user.id,
      businessProfileId: body.businessProfileId ?? null,
      permitType: body.permitType ?? null,
      label: body.label ?? file.originalname,
      notes: body.notes ?? null,
      metadata,
      file,
    });

    const { document: hydrated, downloadUrl } = await this.documentsService.getDocument(user.id, document.id);
    return DocumentResponseDto.fromDomain(hydrated, downloadUrl);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Menghapus dokumen beserta semua versinya' })
  @ApiResponse({ status: 204 })
  async deleteDocument(@Param('id') documentId: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.documentsService.deleteDocument(user.id, documentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail dokumen' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  async getDocument(@Param('id') documentId: string, @CurrentUser() user: AuthenticatedUser): Promise<DocumentResponseDto> {
    const { document, downloadUrl } = await this.documentsService.getDocument(user.id, documentId);
    return DocumentResponseDto.fromDomain(document, downloadUrl);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar dokumen milik pengguna' })
  @ApiResponse({ status: 200, type: [DocumentResponseDto] })
  async listDocuments(
    @CurrentUser() user: AuthenticatedUser,
    @Query('includeDownloadUrl', new ParseBoolPipe({ optional: true })) includeDownloadUrl?: boolean,
  ): Promise<DocumentResponseDto[]> {
    const documents = await this.documentsService.listDocuments(user.id);

    return Promise.all(
      documents.map(async (document) => {
        let downloadUrl: string | undefined;
        if (includeDownloadUrl && document.currentVersion) {
          const { downloadUrl: url } = await this.documentsService.getDocument(user.id, document.id);
          downloadUrl = url;
        }
        return DocumentResponseDto.fromDomain(document, downloadUrl);
      }),
    );
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Mendapatkan daftar versi dokumen' })
  @ApiResponse({ status: 200, type: [DocumentVersionResponseDto] })
  async listVersions(@Param('id') documentId: string, @CurrentUser() user: AuthenticatedUser): Promise<DocumentVersionResponseDto[]> {
    const document = await this.documentsService.ensureOwnership(user.id, documentId);
    return document.versions.map((version) => DocumentVersionResponseDto.fromDomain(version));
  }

  private safeParseMetadata(value?: string): Record<string, unknown> | null {
    if (!value) {
      return null;
    }
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
    } catch (error) {
      throw new BadRequestException('Invalid metadata JSON');
    }
  }

  private safeParseMetadataArray(value: string | undefined, expectedLength: number): Array<Record<string, unknown>> {
    if (!value) {
      return Array.from({ length: expectedLength }, () => ({}));
    }
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new BadRequestException('Metadata payload must be an array');
      }
      if (parsed.length !== expectedLength) {
        throw new BadRequestException('Metadata array length must match files count');
      }
      return parsed.map((item) => (typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid metadata JSON');
    }
  }

  private coerceString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private coerceRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private coercePermitType(value: unknown): PermitType | null {
    if (typeof value !== 'string') {
      return null;
    }
    const upper = value.toUpperCase();
    return Object.values(PermitType).includes(upper as PermitType) ? (upper as PermitType) : null;
  }
}
