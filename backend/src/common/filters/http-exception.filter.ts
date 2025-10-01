import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const payload = res as Record<string, unknown>;
        message = (payload.message as string | string[]) ?? message;
        errorName = (payload.error as string) ?? exception.name;
      } else {
        message = exception.message;
      }
      errorName = exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception for ${request.method} ${request.url}`,
        exception as Error,
      );
    }

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
