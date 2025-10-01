import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/interfaces/authenticated-user.interface';
import { SubscriptionPlansService } from '../../application/services/subscription-plans.service';
import { SubscriptionsService } from '../../application/services/subscriptions.service';
import { SubscriptionPlanResponseDto } from '../dto/subscription-plan-response.dto';
import { SubscriptionResponseDto } from '../dto/subscription-response.dto';
import { CreateSubscriptionRequestDto } from '../dto/create-subscription.request.dto';
import { SubscriptionCheckoutResponseDto } from '../dto/subscription-checkout-response.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionPlansService: SubscriptionPlansService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Daftar paket langganan aktif' })
  @ApiResponse({ status: 200, type: [SubscriptionPlanResponseDto] })
  async listPlans(): Promise<SubscriptionPlanResponseDto[]> {
    const plans = await this.subscriptionPlansService.listActivePlans();
    return plans.map(SubscriptionPlanResponseDto.fromEntity);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Status langganan aktif milik pengguna' })
  @ApiResponse({
    status: 200,
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/SubscriptionResponseDto' },
        { type: 'null' },
      ],
    },
  })
  async getMySubscription(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubscriptionResponseDto | null> {
    const subscription = await this.subscriptionsService.getActiveSubscription(
      user.id,
    );
    return subscription
      ? SubscriptionResponseDto.fromEntity(subscription)
      : null;
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buat transaksi pembayaran langganan' })
  @ApiResponse({ status: 201, type: SubscriptionCheckoutResponseDto })
  async createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateSubscriptionRequestDto,
  ): Promise<SubscriptionCheckoutResponseDto> {
    const result = await this.subscriptionsService.createSubscriptionCheckout({
      userId: user.id,
      planId: body.planId,
      customer: {
        name: user.name,
        email: user.email,
      },
    });

    return SubscriptionCheckoutResponseDto.fromResult(result);
  }
}
