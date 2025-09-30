import { ApiProperty } from '@nestjs/swagger';
import {
  AiWorkspaceResponse,
  WorkspaceDocumentDto,
  WorkspaceSummaryDto,
  WorkspaceTaskDto,
  WorkspaceDocumentStatus,
  WorkspaceOverallStatus,
  WorkspaceRiskLevel,
  WorkspaceTaskPriority,
  WorkspaceTaskStatus,
} from '../../../assistant/application/services/assistant.service';

export class WorkspaceAnalysisTaskResponseDto {
  @ApiProperty({ description: 'Identifier task' })
  id: string;

  @ApiProperty({ description: 'Judul task' })
  title: string;

  @ApiProperty({ enum: ['todo', 'in_progress', 'blocked', 'done'] })
  status: WorkspaceTaskStatus;

  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  priority: WorkspaceTaskPriority;

  @ApiProperty({ required: false, nullable: true, description: 'Jenis izin terkait' })
  permitType: string | null;

  @ApiProperty({ description: 'Ringkasan apa yang harus dilakukan' })
  description: string;

  @ApiProperty({ type: [String], description: 'Langkah tindakan selanjutnya' })
  nextActions: string[];

  @ApiProperty({ type: [String], description: 'Daftar ID dokumen yang terkait' })
  relatedDocuments: string[];

  @ApiProperty({ required: false, nullable: true, description: 'Due date dalam ISO string bila tersedia' })
  dueDate: string | null;

  @ApiProperty({ required: false, nullable: true, description: 'Alasan task terblokir jika ada' })
  blockedReason: string | null;

  static fromAi(task: WorkspaceTaskDto): WorkspaceAnalysisTaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      permitType: task.permit_type ?? null,
      description: task.description,
      nextActions: task.next_actions,
      relatedDocuments: task.related_documents,
      dueDate: task.due_date ?? null,
      blockedReason: task.blocked_reason ?? null,
    };
  }
}

export class WorkspaceAnalysisDocumentResponseDto {
  @ApiProperty({ description: 'Identifier dokumen atau placeholder' })
  id: string;

  @ApiProperty({ description: 'Nama dokumen' })
  title: string;

  @ApiProperty({ enum: ['missing', 'collecting', 'ready', 'submitted'] })
  status: WorkspaceDocumentStatus;

  @ApiProperty({ required: false, nullable: true })
  permitType: string | null;

  @ApiProperty({ description: 'Ringkasan status dokumen' })
  summary: string;

  @ApiProperty({ type: [String], description: 'Aksi yang perlu dilakukan agar dokumen siap' })
  requiredActions: string[];

  @ApiProperty({ type: [String], description: 'Task ID yang berelasi dengan dokumen ini' })
  linkedTasks: string[];

  static fromAi(document: WorkspaceDocumentDto): WorkspaceAnalysisDocumentResponseDto {
    return {
      id: document.id,
      title: document.title,
      status: document.status,
      permitType: document.permit_type ?? null,
      summary: document.summary,
      requiredActions: document.required_actions,
      linkedTasks: document.linked_tasks,
    };
  }
}

export class WorkspaceAnalysisSummaryResponseDto {
  @ApiProperty({ description: 'Headline insight' })
  headline: string;

  @ApiProperty({ enum: ['on_track', 'at_risk', 'blocked'] })
  overallStatus: WorkspaceOverallStatus;

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  riskLevel: WorkspaceRiskLevel;

  @ApiProperty({ description: 'Langkah berikutnya yang direkomendasikan' })
  nextAction: string;

  static fromAi(summary: WorkspaceSummaryDto): WorkspaceAnalysisSummaryResponseDto {
    return {
      headline: summary.headline,
      overallStatus: summary.overall_status,
      riskLevel: summary.risk_level,
      nextAction: summary.next_action,
    };
  }
}

export class WorkspaceAnalysisResponseDto {
  @ApiProperty({ type: () => WorkspaceAnalysisSummaryResponseDto })
  summary: WorkspaceAnalysisSummaryResponseDto;

  @ApiProperty({ type: () => [WorkspaceAnalysisTaskResponseDto] })
  tasks: WorkspaceAnalysisTaskResponseDto[];

  @ApiProperty({ type: () => [WorkspaceAnalysisDocumentResponseDto] })
  documents: WorkspaceAnalysisDocumentResponseDto[];

  static fromAiResponse(response: AiWorkspaceResponse): WorkspaceAnalysisResponseDto {
    return {
      summary: WorkspaceAnalysisSummaryResponseDto.fromAi(response.summary),
      tasks: response.tasks.map((task) => WorkspaceAnalysisTaskResponseDto.fromAi(task)),
      documents: response.documents.map((document) => WorkspaceAnalysisDocumentResponseDto.fromAi(document)),
    };
  }
}
