import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';

@Injectable()
export class DocsService {
  private document: OpenAPIObject | null = null;

  setDocument(document: OpenAPIObject): void {
    this.document = document;
  }

  getDocument(): OpenAPIObject {
    if (!this.document) {
      throw new ServiceUnavailableException('API documentation is not enabled');
    }
    return this.document;
  }
}
