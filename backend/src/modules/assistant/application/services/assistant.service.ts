import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export type AskCommand = {
  question: string;
  permitType?: string | null;
  region?: string | null;
  userId: string;
};

export type AiCitation = {
  url?: string;
  title?: string;
  section?: string;
  snippet?: string;
};

export type AiAskResponse = {
  answer_md: string;
  citations: AiCitation[];
  retrieval_meta?: Record<string, unknown>;
  model_meta?: Record<string, unknown>;
};

export type WorkspaceTaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type WorkspaceTaskPriority = 'high' | 'medium' | 'low';
export type WorkspaceDocumentStatus =
  | 'missing'
  | 'collecting'
  | 'ready'
  | 'submitted';
export type WorkspaceOverallStatus = 'on_track' | 'at_risk' | 'blocked';
export type WorkspaceRiskLevel = 'low' | 'medium' | 'high';

type HttpErrorLike = {
  message?: string;
  response?: { status?: number; data?: unknown };
  stack?: string;
};

const isHttpErrorLike = (error: unknown): error is HttpErrorLike => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const candidate = error as Record<string, unknown>;
  const hasMessage = typeof candidate.message === 'string';
  const hasResponse =
    candidate.response !== undefined &&
    typeof candidate.response === 'object' &&
    candidate.response !== null;
  return hasMessage || hasResponse;
};

export interface WorkspaceTaskDto {
  id: string;
  title: string;
  status: WorkspaceTaskStatus;
  priority: WorkspaceTaskPriority;
  permit_type: string | null;
  description: string;
  next_actions: string[];
  related_documents: string[];
  due_date: string | null;
  blocked_reason: string | null;
}

export interface WorkspaceDocumentDto {
  id: string;
  title: string;
  status: WorkspaceDocumentStatus;
  permit_type: string | null;
  summary: string;
  required_actions: string[];
  linked_tasks: string[];
}

export interface WorkspaceSummaryDto {
  headline: string;
  overall_status: WorkspaceOverallStatus;
  risk_level: WorkspaceRiskLevel;
  next_action: string;
}

export interface AiWorkspaceResponse {
  summary: WorkspaceSummaryDto;
  tasks: WorkspaceTaskDto[];
  documents: WorkspaceDocumentDto[];
}

export type WorkspaceAnalysisCommand = {
  businessProfile: Record<string, unknown> | null;
  permits: Array<Record<string, unknown>>;
  documents: Array<Record<string, unknown>>;
  locale?: string;
};

const TASK_STATUS_VALUES: WorkspaceTaskStatus[] = [
  'todo',
  'in_progress',
  'blocked',
  'done',
];
const TASK_PRIORITY_VALUES: WorkspaceTaskPriority[] = ['high', 'medium', 'low'];
const DOCUMENT_STATUS_VALUES: WorkspaceDocumentStatus[] = [
  'missing',
  'collecting',
  'ready',
  'submitted',
];
const OVERALL_STATUS_VALUES: WorkspaceOverallStatus[] = [
  'on_track',
  'at_risk',
  'blocked',
];
const RISK_LEVEL_VALUES: WorkspaceRiskLevel[] = ['low', 'medium', 'high'];

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async ask(command: AskCommand): Promise<AiAskResponse> {
    const baseUrl =
      this.configService.get<string>('AI_SERVICE_BASE_URL') ??
      'http://localhost:7700';
    const bearerToken = this.configService.get<string>('AI_SERVICE_TOKEN');
    const timeoutMs = Number(
      this.configService.get<string>('AI_SERVICE_TIMEOUT_MS') ?? 15000,
    );
    const endpoint = this.normalizeEndpoint(baseUrl);

    const payload = {
      question: command.question,
      permit_type: command.permitType ?? null,
      region: command.region ?? 'DIY',
      user_id: command.userId,
    } satisfies Record<string, unknown>;

    try {
      const { data } = await this.httpService.axiosRef.post<AiAskResponse>(
        endpoint,
        payload,
        {
          headers: bearerToken
            ? { Authorization: `Bearer ${bearerToken}` }
            : undefined,
          timeout: timeoutMs,
        },
      );
      if (!data || typeof data.answer_md !== 'string') {
        throw new Error('Invalid response payload from AI service');
      }
      return data;
    } catch (error) {
      return this.handleError(error, endpoint);
    }
  }

  async analyzeWorkspace(
    command: WorkspaceAnalysisCommand,
  ): Promise<AiWorkspaceResponse> {
    const baseUrl =
      this.configService.get<string>('AI_SERVICE_BASE_URL') ??
      'http://localhost:7700';
    const bearerToken = this.configService.get<string>('AI_SERVICE_TOKEN');
    const timeoutMs = Number(
      this.configService.get<string>('AI_SERVICE_TIMEOUT_MS') ?? 15000,
    );
    const endpoint = this.normalizeWorkspaceEndpoint(baseUrl);

    const payload = {
      business_profile: command.businessProfile,
      permits: command.permits,
      documents: command.documents,
      locale: command.locale ?? 'id-ID',
    } satisfies Record<string, unknown>;

    try {
      const { data } = await this.httpService.axiosRef.post(endpoint, payload, {
        headers: bearerToken
          ? { Authorization: 'Bearer ' + bearerToken }
          : undefined,
        timeout: timeoutMs,
      });
      return this.normalizeWorkspaceResponse(data);
    } catch (error) {
      return this.handleError(error, endpoint);
    }
  }

  private normalizeEndpoint(baseUrl: string): string {
    const trimmed = baseUrl.replace(/\/+$/, '');
    return `${trimmed}/v1/qa/query`;
  }

  private normalizeWorkspaceEndpoint(baseUrl: string): string {
    const trimmed = baseUrl.replace(/\/+$/, '');
    return `${trimmed}/v1/workspace/analyze`;
  }

  private normalizeWorkspaceResponse(raw: unknown): AiWorkspaceResponse {
    const record = this.ensureRecord(raw);
    const summary = this.coerceSummary(record.summary);
    const tasksRaw = Array.isArray(record.tasks) ? record.tasks : [];
    const documentsRaw = Array.isArray(record.documents)
      ? record.documents
      : [];
    const tasks = tasksRaw.map((task, index) => this.coerceTask(task, index));
    const documents = documentsRaw.map((doc, index) =>
      this.coerceDocument(doc, index),
    );
    return { summary, tasks, documents };
  }

  private coerceTask(value: unknown, index: number): WorkspaceTaskDto {
    const record = this.ensureRecord(value);
    const id = this.coerceString(record.id) ?? `task-${index + 1}`;
    const title = this.coerceString(record.title) ?? 'Tugas Kepatuhan';
    const description =
      this.coerceString(record.description) ?? 'Detail tugas belum tersedia.';
    const status = this.coerceEnum(record.status, TASK_STATUS_VALUES, 'todo');
    const priority = this.coerceEnum(
      record.priority,
      TASK_PRIORITY_VALUES,
      'medium',
    );
    const permitType = this.coerceString(record['permit_type']);
    const nextActions = this.coerceStringArray(record['next_actions']);
    const relatedDocuments = this.coerceStringArray(
      record['related_documents'],
    );
    const dueDate = this.coerceString(record['due_date']);
    const blockedReason = this.coerceString(record['blocked_reason']);
    return {
      id,
      title,
      status,
      priority,
      permit_type: permitType,
      description,
      next_actions: nextActions,
      related_documents: relatedDocuments,
      due_date: dueDate,
      blocked_reason: blockedReason,
    };
  }

  private coerceDocument(value: unknown, index: number): WorkspaceDocumentDto {
    const record = this.ensureRecord(value);
    const id = this.coerceString(record.id) ?? `doc-${index + 1}`;
    const title = this.coerceString(record.title) ?? 'Dokumen Pendukung';
    const status = this.coerceEnum(
      record.status,
      DOCUMENT_STATUS_VALUES,
      'collecting',
    );
    const permitType = this.coerceString(record['permit_type']);
    const summary =
      this.coerceString(record.summary) ?? 'Status dokumen belum tersedia.';
    const requiredActions = this.coerceStringArray(record['required_actions']);
    const linkedTasks = this.coerceStringArray(record['linked_tasks']);
    return {
      id,
      title,
      status,
      permit_type: permitType,
      summary,
      required_actions: requiredActions,
      linked_tasks: linkedTasks,
    };
  }

  private coerceSummary(value: unknown): WorkspaceSummaryDto {
    const record = this.ensureRecord(value);
    const headline =
      this.coerceString(record.headline) ??
      'Checklist izin perlu ditindaklanjuti';
    const overallStatus = this.coerceEnum(
      record['overall_status'],
      OVERALL_STATUS_VALUES,
      'at_risk',
    );
    const riskLevel = this.coerceEnum(
      record['risk_level'],
      RISK_LEVEL_VALUES,
      'medium',
    );
    const nextAction =
      this.coerceString(record['next_action']) ??
      'Buka toolbar AI untuk melanjutkan langkah berikutnya';
    return {
      headline,
      overall_status: overallStatus,
      risk_level: riskLevel,
      next_action: nextAction,
    };
  }

  private ensureRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  }

  private coerceString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private coerceStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0,
      )
      .map((item) => item.trim());
  }

  private coerceEnum<T extends string>(
    value: unknown,
    allowed: readonly T[],
    fallback: T,
  ): T {
    if (typeof value === 'string' && allowed.includes(value as T)) {
      return value as T;
    }
    return fallback;
  }

  private handleError(error: unknown, endpoint: string): never {
    if (isHttpErrorLike(error)) {
      const statusCode = error.response?.status;
      const detail: unknown = error.response?.data ?? error.message;
      this.logger.error(
        'AI service request failed',
        JSON.stringify({ endpoint, statusCode, detail }),
      );
    } else if (error instanceof Error) {
      this.logger.error('AI service request failed', error.stack, { endpoint });
    } else {
      this.logger.error(
        'AI service request failed with unknown error',
        undefined,
        {
          endpoint,
        },
      );
    }
    throw new BadGatewayException(
      'Gagal menghubungi layanan AI, silakan coba kembali.',
    );
  }
}
