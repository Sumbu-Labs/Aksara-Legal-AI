import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssistantService } from '../../application/services/assistant.service';
import { AskRequestDto } from '../dto/ask.request.dto';
import { AskResponseDto } from '../dto/ask.response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/interfaces/authenticated-user.interface';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Ajukan pertanyaan kepada Asisten AI' })
  @ApiResponse({
    status: 200,
    description: 'Jawaban berhasil diperoleh dari layanan AI.',
    type: AskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token autentikasi tidak valid.' })
  @ApiResponse({
    status: 502,
    description: 'Layanan AI tidak dapat dihubungi.',
  })
  async ask(
    @Body() body: AskRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<AskResponseDto> {
    if (!user) {
      throw new UnauthorizedException();
    }

    const response = await this.assistantService.ask({
      question: body.question,
      permitType: body.permitType ?? null,
      region:
        body.region && body.region.trim().length > 0 ? body.region : 'DIY',
      userId: user.id,
    });

    return AskResponseDto.fromAi(response);
  }
}
