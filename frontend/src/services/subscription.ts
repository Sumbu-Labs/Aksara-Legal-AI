'use client';

import { extractErrorMessage, getBackendBaseUrl } from './api-client';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  metadata: Record<string, unknown> | null;
};

export type Subscription = {
  id: string;
  planId: string;
  status: 'PENDING' | 'ACTIVE' | 'CANCELED' | 'EXPIRED';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  midtransSubscriptionId: string | null;
  plan?: SubscriptionPlan;
};

export type PaymentTransaction = {
  id: string;
  subscriptionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'EXPIRED';
  amount: number;
  currency: string;
  paymentType: string | null;
  midtransOrderId: string;
  midtransTransactionId: string | null;
  snapToken: string | null;
  snapRedirectUrl: string | null;
  paidAt: string | null;
};

export type SubscriptionCheckoutResponse = {
  subscription: Subscription;
  payment: PaymentTransaction;
};

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await fetch(`${getBackendBaseUrl()}/subscriptions/plans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message || 'Gagal mengambil daftar paket langganan.');
  }

  return (await response.json()) as SubscriptionPlan[];
}

export async function fetchActiveSubscription(accessToken: string): Promise<Subscription | null> {
  const response = await fetch(`${getBackendBaseUrl()}/subscriptions/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message || 'Gagal mengambil status langganan.');
  }

  return (await response.json()) as Subscription | null;
}

export async function createSubscriptionCheckout(
  accessToken: string,
  payload: { planId: string },
): Promise<SubscriptionCheckoutResponse> {
  const response = await fetch(`${getBackendBaseUrl()}/subscriptions/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message || 'Gagal membuat transaksi langganan.');
  }

  return (await response.json()) as SubscriptionCheckoutResponse;
}
