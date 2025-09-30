import { Controller, Get, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/interfaces/authenticated-user.interface';
import { WorkspaceService } from '../../application/services/workspace.service';
import { WorkspaceSummaryResponseDto } from '../dto/workspace-summary.response.dto';

@ApiTags('Workspace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan Task List dan analisis AI' })
  @ApiResponse({ status: 200, type: WorkspaceSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  async getSummary(
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<WorkspaceSummaryResponseDto> {
    const userId = this.ensureUser(user);
    return this.workspaceService.getSummary(userId);
  }

  private ensureUser(user: AuthenticatedUser | undefined): string {
    if (!user) {
      throw new UnauthorizedException('User context missing');
    }
    return user.id;
  }
}
