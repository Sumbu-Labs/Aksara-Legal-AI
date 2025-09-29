import { Express } from 'express';
import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';

export interface UploadDocumentCommand {
  userId: string;
  businessProfileId?: string | null;
  permitType?: PermitType | null;
  label?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  file: Express.Multer.File;
}

export interface ReplaceDocumentCommand extends UploadDocumentCommand {
  documentId: string;
}

export interface BatchUploadDocumentCommand {
  userId: string;
  documents: Array<Omit<UploadDocumentCommand, 'userId'>>;
}
