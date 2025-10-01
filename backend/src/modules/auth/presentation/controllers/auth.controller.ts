import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
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
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterRequestDto): Promise<AuthTokensResponseDto> {
    const session = await this.authService.register(dto);
    return new AuthTokensResponseDto(session);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate using email and password' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginRequestDto): Promise<AuthTokensResponseDto> {
    const session = await this.authService.login(dto);
    return new AuthTokensResponseDto(session);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exchange a refresh token for new tokens' })
  @ApiResponse({ status: 200, type: AuthTokensResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token invalid or missing' })
  async refresh(@Req() req: RequestWithUser): Promise<AuthTokensResponseDto> {
    const user = req.user;
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }


    const session = await this.authService.refreshTokens(user.id, user.refreshToken);
    return new AuthTokensResponseDto(session);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke refresh token for the current user' })
  @ApiResponse({ status: 204, description: 'Refresh token cleared' })
  @ApiResponse({ status: 401, description: 'Invalid or missing access token' })
  async logout(@Req() req: RequestWithUser): Promise<void> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User context missing');
    }

    await this.authService.clearRefreshToken(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate the current access token' })
  @ApiResponse({ status: 200, description: 'Authenticated user payload' })
  @ApiResponse({ status: 401, description: 'Invalid or missing access token' })
  check(@Req() req: RequestWithUser) {
    return req.user;
  }
}
