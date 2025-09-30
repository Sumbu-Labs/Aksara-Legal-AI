import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';

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

  private normalizeEndpoint(baseUrl: string): string {
    const trimmed = baseUrl.replace(/\/+$/, '');
    return `${trimmed}/v1/qa/query`;
  }

  private handleError(error: unknown, endpoint: string): never {
    if (error instanceof AxiosError) {
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
