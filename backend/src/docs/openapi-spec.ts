import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { AuthTokensResponseDto } from '../modules/auth/presentation/dto/auth-tokens-response.dto';
import { AuthenticatedUserDto } from '../modules/auth/presentation/dto/authenticated-user.dto';
import { BusinessProfileResponseDto } from '../modules/business-profile/presentation/dto/business-profile-response.dto';
import { BusinessPermitProfileDto } from '../modules/business-profile/presentation/dto/business-permit-profile.dto';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const configService = app.get(ConfigService, { strict: false });
  const appName = configService?.get<string>('APP_NAME') ?? 'Aksara Legal API';
  const appDescription = configService?.get<string>('APP_DESCRIPTION') ??
    'API documentation for Aksara Legal services';
  const port = configService?.get<string>('PORT') ?? '3000';
  const baseUrl =
    configService?.get<string>('URL') ?? `http://localhost:${port}`;

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(appDescription)
    .setVersion('1.0.0')
    .addServer(baseUrl)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token',
      },
      'bearer',
    )
    .build();

  return SwaggerModule.createDocument(app, config, {
    extraModels: [
      AuthTokensResponseDto,
      AuthenticatedUserDto,
      BusinessProfileResponseDto,
      BusinessPermitProfileDto,
    ],
  });
}
