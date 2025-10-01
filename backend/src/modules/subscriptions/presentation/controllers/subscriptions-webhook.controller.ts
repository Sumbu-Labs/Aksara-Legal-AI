import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionsService } from '../../application/services/subscriptions.service';
import { MidtransWebhookDto } from '../dto/midtrans-webhook.dto';

@ApiTags('Subscriptions')
@ApiExcludeController()
@Controller('subscriptions/webhook')
export class SubscriptionsWebhookController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('midtrans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook Midtrans untuk memperbarui status langganan',
  })
  @ApiResponse({ status: 200, description: 'Webhook diproses' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async handleMidtransWebhook(
    @Body() body: MidtransWebhookDto,
    @Headers('x-callback-token') callbackToken?: string,
  ): Promise<{ status: string }> {
    await this.subscriptionsService.processMidtransWebhook(body, callbackToken);
    return { status: 'ok' };
  }
}
