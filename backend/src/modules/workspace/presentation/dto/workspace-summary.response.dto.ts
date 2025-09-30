import { ApiProperty } from '@nestjs/swagger';
import { BusinessProfileResponseDto } from '../../../business-profile/presentation/dto/business-profile-response.dto';
import { WorkspaceAnalysisResponseDto } from './workspace-analysis.response.dto';
import { WorkspaceDocumentSnapshotDto } from './workspace-document-snapshot.dto';

export class WorkspaceSummaryResponseDto {
  @ApiProperty({ type: () => BusinessProfileResponseDto, required: false, nullable: true })
  profile: BusinessProfileResponseDto | null;

  @ApiProperty({ type: () => [WorkspaceDocumentSnapshotDto] })
  documents: WorkspaceDocumentSnapshotDto[];

  @ApiProperty({ type: () => WorkspaceAnalysisResponseDto })
  analysis: WorkspaceAnalysisResponseDto;

  static create(
    profile: BusinessProfileResponseDto | null,
    documents: WorkspaceDocumentSnapshotDto[],
    analysis: WorkspaceAnalysisResponseDto,
  ): WorkspaceSummaryResponseDto {
    return {
      profile,
      documents,
      analysis,
    };
  }
}
