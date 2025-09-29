import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiReference } from '@scalar/nestjs-api-reference';
import { DocsService } from './docs.service';
import { buildOpenApiDocument } from './openapi-spec';

function isEnabled(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return false;
}

export async function setupDocs(app: INestApplication): Promise<void> {
  const configService = app.get(ConfigService, { strict: false });
  const explicitFlag = configService?.get('ENABLE_API_DOCS');
  const nodeEnv = configService?.get<string>('NODE_ENV') ?? 'development';
  const shouldEnable =
    isEnabled(explicitFlag) || (!explicitFlag && nodeEnv !== 'production');

  if (!shouldEnable) {
    return;
  }

  const document = buildOpenApiDocument(app);
  const docsService = app.get(DocsService);
  docsService.setDocument(document);

  app.use(
    '/docs',
    apiReference({
      pageTitle: `${configService?.get<string>('APP_NAME') ?? 'Aksara Legal API'} Reference`,
      layout: 'modern',
      theme: 'kepler',
      spec: {
        content: document,
      },
    }),
  );

  const logger = new Logger('Docs');
  const port = configService?.get<string>('PORT') ?? '3000';
  const baseUrl = configService?.get<string>('URL') ?? `http://localhost:${port}`;
  logger.log(`Scalar API Reference available at ${baseUrl}/docs`);
  logger.log(`Scalar HTML documentation available at ${baseUrl}/docs/html`);
  logger.log(`OpenAPI schema available at ${baseUrl}/docs/openapi.json`);
}
