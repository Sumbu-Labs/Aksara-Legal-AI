'use client';

import { extractErrorMessage, getBackendBaseUrl } from './api-client';

export type TokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload): Promise<TokensResponse> {
  const response = await fetch(`${getBackendBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message || 'Pendaftaran gagal.');
  }

  return (await response.json()) as TokensResponse;
}

export async function login(payload: LoginPayload): Promise<TokensResponse> {
  const response = await fetch(`${getBackendBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message || 'Masuk gagal.');
  }

  return (await response.json()) as TokensResponse;
}

export function persistTokens(tokens: TokensResponse): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('accessToken', tokens.accessToken);
      window.localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  } catch (error) {
    console.error('Failed to persist tokens', error);
  }
}
