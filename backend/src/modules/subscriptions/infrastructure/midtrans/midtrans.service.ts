import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { createHash } from 'node:crypto';
import { firstValueFrom } from 'rxjs';

export type MidtransCustomerDetails = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type MidtransItemDetail = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type MidtransCreateTransactionPayload = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: MidtransCustomerDetails;
  item_details?: MidtransItemDetail[];
};

export type MidtransSnapTransactionResponse = {
  token: string;
  redirect_url: string;
};

export type MidtransNotificationPayload = {
  order_id: string;
  transaction_id: string;
  gross_amount: string;
  status_code: string;
  transaction_status: string;
  payment_type?: string;
  signature_key: string;
  fraud_status?: string;
  settlement_time?: string;
};

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private readonly snapBaseUrl: string;
  private readonly serverKey: string;
  private readonly webhookSecret?: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const isProduction = this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';
    this.snapBaseUrl = isProduction ? 'https://app.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1';
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') ?? '';
    this.webhookSecret = this.configService.get<string>('MIDTRANS_WEBHOOK_SECRET') ?? undefined;
  }

  async createSnapTransaction(payload: MidtransCreateTransactionPayload): Promise<MidtransSnapTransactionResponse> {
    if (!this.serverKey) {
      this.logger.error('MIDTRANS_SERVER_KEY is not configured');
      throw new Error('Midtrans server key is not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.snapBaseUrl}/transactions`, payload, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data as MidtransSnapTransactionResponse;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Failed to create Midtrans transaction: ${error.message}`,
          error.response?.data ? JSON.stringify(error.response.data) : undefined,
        );
      } else {
        this.logger.error('Failed to create Midtrans transaction', error as Error);
      }
      throw new Error('Failed to create Midtrans transaction');
    }
  }

  verifySignature(notification: MidtransNotificationPayload): boolean {
    if (!this.serverKey) {
      this.logger.warn('Cannot verify Midtrans signature without server key');
      return false;
    }

    const rawSignature = `${notification.order_id}${notification.status_code}${notification.gross_amount}${this.serverKey}`;
    const expectedSignature = createHash('sha512').update(rawSignature).digest('hex');
    return expectedSignature === notification.signature_key;
  }

  isCallbackTokenValid(token: string | undefined): boolean {
    if (!this.webhookSecret) {
      return true;
    }
    return token === this.webhookSecret;
  }
}
