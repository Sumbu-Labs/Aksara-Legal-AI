import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { DocsService } from './docs.service';

@ApiExcludeController()
@Controller('docs')
export class ScalarDocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get('openapi.json')
  getOpenApiSchema() {
    return this.docsService.getDocument();
  }

  @Get('html')
  @Header('Content-Type', 'text/html; charset=utf-8')
  serveHtml(@Res() res: Response) {
    const htmlPath = join(process.cwd(), 'public', 'scalar-docs.html');
    return res.sendFile(htmlPath);
  }
}
