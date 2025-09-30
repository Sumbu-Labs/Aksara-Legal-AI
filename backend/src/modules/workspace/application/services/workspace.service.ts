import { Injectable } from '@nestjs/common';
import { BusinessProfileService } from '../../../business-profile/application/services/business-profile.service';
import { DocumentsService } from '../../../documents/application/services/documents.service';
import { AssistantService,
  WorkspaceAnalysisCommand,
} from '../../../assistant/application/services/assistant.service';
import { BusinessProfileResponseDto } from '../../../business-profile/presentation/dto/business-profile-response.dto';
import { DocumentResponseDto } from '../../../documents/presentation/dto/document-response.dto';
import { WorkspaceAnalysisResponseDto } from '../../presentation/dto/workspace-analysis.response.dto';
import { WorkspaceDocumentSnapshotDto } from '../../presentation/dto/workspace-document-snapshot.dto';
import { WorkspaceSummaryResponseDto } from '../../presentation/dto/workspace-summary.response.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly businessProfileService: BusinessProfileService,
    private readonly documentsService: DocumentsService,
    private readonly assistantService: AssistantService,
  ) {}

  async getSummary(userId: string): Promise<WorkspaceSummaryResponseDto> {
    const profile = await this.businessProfileService.getProfileByUser(userId);
    const profileDto = profile ? BusinessProfileResponseDto.fromDomain(profile) : null;

    const documents = await this.documentsService.listDocuments(userId);
    const documentDtos = documents.map((document) => DocumentResponseDto.fromDomain(document));

    const command = this.buildAnalysisCommand(profileDto, documentDtos);
    const aiResponse = await this.assistantService.analyzeWorkspace(command);
    const analysisDto = WorkspaceAnalysisResponseDto.fromAiResponse(aiResponse);
    const documentSnapshots = documentDtos.map((document) => WorkspaceDocumentSnapshotDto.fromDocument(document));

    return WorkspaceSummaryResponseDto.create(profileDto, documentSnapshots, analysisDto);
  }

  private buildAnalysisCommand(
    profile: BusinessProfileResponseDto | null,
    documents: DocumentResponseDto[],
  ): WorkspaceAnalysisCommand {
    const permits = profile ? this.serializePermits(profile.permits) : [];
    const businessProfile = profile ? this.serializeBusinessProfile(profile) : null;
    const documentPayload = documents.map((document) => this.serializeDocument(document));

    return {
      businessProfile,
      permits,
      documents: documentPayload,
      locale: 'id-ID',
    };
  }

  private serializeBusinessProfile(profile: BusinessProfileResponseDto): Record<string, unknown> {
    return {
      id: profile.id,
      user_id: profile.userId,
      business_name: profile.businessName,
      business_type: profile.businessType,
      business_scale: profile.businessScale,
      province: profile.province,
      city: profile.city,
      address: profile.address,
      industry_tags: profile.industryTags,
      completed_at: profile.completedAt ? this.toIsoString(profile.completedAt) : null,
      created_at: this.toIsoString(profile.createdAt),
      updated_at: this.toIsoString(profile.updatedAt),
      permits: this.serializePermits(profile.permits),
    };
  }

  private serializePermits(
    permits: BusinessProfileResponseDto['permits'],
  ): Array<Record<string, unknown>> {
    return permits.map((permit) => ({
      id: permit.id,
      permit_type: permit.permitType,
      is_checklist_complete: permit.isChecklistComplete,
      field_checklist: permit.fieldChecklist ?? null,
      documents: permit.documents ?? null,
      updated_at: this.toIsoString(permit.updatedAt),
      created_at: this.toIsoString(permit.createdAt),
    }));
  }

  private serializeDocument(document: DocumentResponseDto): Record<string, unknown> {
    const currentVersion = document.currentVersion;
    return {
      id: document.id,
      label: document.label ?? null,
      permit_type: document.permitType ?? null,
      filename: currentVersion?.originalFilename ?? null,
      size: currentVersion?.size ?? null,
      metadata: currentVersion?.metadata ?? null,
      notes: currentVersion?.notes ?? null,
      uploaded_at: this.toIsoString(document.createdAt),
      updated_at: this.toIsoString(document.updatedAt),
    };
  }

  private toIsoString(value: Date | string | null | undefined): string {
    if (!value) {
      return new Date(0).toISOString();
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
  }
}


