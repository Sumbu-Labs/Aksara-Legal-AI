import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { AuthenticatedUser } from '../../domain/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../infrastructure/guards/jwt-refresh.guard';
import { AuthTokensResponseDto } from '../dto/auth-tokens-response.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';

interface RequestWithUser extends Request {
  user: (AuthenticatedUser & { refreshToken?: string }) | undefined;
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({ status: 201, type: AuthTokensResponseDto })
  async register(@Body() dto: RegisterRequestDto): Promise<AuthTokensResponseDto> {
    const tokens = await this.authService.register(dto);
    return new AuthTokensResponseDto(tokens);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate using email and password' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  async login(@Body() dto: LoginRequestDto): Promise<AuthTokensResponseDto> {
    const tokens = await this.authService.login(dto);
    return new AuthTokensResponseDto(tokens);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exchange a refresh token for new tokens' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  async refresh(@Req() req: RequestWithUser): Promise<AuthTokensResponseDto> {
    const user = req.user;
    if (!user?.refreshToken) {
      throw new InternalServerErrorException('Refresh token not provided by guard');
    }

    const tokens = await this.authService.refreshTokens(user.id, user.refreshToken);
    return new AuthTokensResponseDto(tokens);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate the current access token' })
  @ApiResponse({ status: 200, description: 'Authenticated user payload' })
  check(@Req() req: RequestWithUser) {
    return req.user;
  }
}
