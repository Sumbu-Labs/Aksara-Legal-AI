import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { ScalarDocsController } from './scalar-docs.controller';

@Module({
  providers: [DocsService],
  controllers: [ScalarDocsController],
  exports: [DocsService],
})
export class DocsModule {}
