import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/interfaces/authenticated-user.interface';
import { WorkspaceService } from '../../application/services/workspace.service';
import { WorkspaceSummaryResponseDto } from '../dto/workspace-summary.response.dto';

@ApiTags('Workspace')
@Controller('workspace')
export class WorkspaceController {
  private readonly fallbackUserId =
    process.env.DEFAULT_WORKSPACE_USER_ID ?? 'demo-user';

  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan Task List dan analisis AI' })
  @ApiResponse({ status: 200, type: WorkspaceSummaryResponseDto })
  async getSummary(
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<WorkspaceSummaryResponseDto> {
    const userId = user?.id ?? this.fallbackUserId;
    return this.workspaceService.getSummary(userId);
  }
}
