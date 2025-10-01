import { Module } from '@nestjs/common';
import { AssistantModule } from '../assistant/assistant.module';
import { BusinessProfileModule } from '../business-profile/business-profile.module';
import { DocumentsModule } from '../documents/documents.module';
import { WorkspaceService } from './application/services/workspace.service';
import { WorkspaceController } from './presentation/controllers/workspace.controller';

@Module({
  imports: [AssistantModule, BusinessProfileModule, DocumentsModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
