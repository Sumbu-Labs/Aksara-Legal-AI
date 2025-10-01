export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'EXPIRED';

export type PaymentTransactionEntity = {
  id: string;
  subscriptionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentType: string | null;
  midtransOrderId: string;
  midtransTransactionId: string | null;
  snapToken: string | null;
  snapRedirectUrl: string | null;
  rawResponse: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaymentTransactionRepository {
  create(transaction: Pick<
    PaymentTransactionEntity,
    'subscriptionId' | 'status' | 'amount' | 'currency' | 'midtransOrderId'
  > & { metadata?: Record<string, unknown> | null }): Promise<PaymentTransactionEntity>;
  update(
    id: string,
    data: Partial<
      Pick<
        PaymentTransactionEntity,
        | 'status'
        | 'paymentType'
        | 'midtransTransactionId'
        | 'snapToken'
        | 'snapRedirectUrl'
        | 'rawResponse'
        | 'metadata'
        | 'paidAt'
      >
    >,
  ): Promise<PaymentTransactionEntity>;
  findByMidtransOrderId(orderId: string): Promise<PaymentTransactionEntity | null>;
}
