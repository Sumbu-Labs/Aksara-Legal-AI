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

const DEFAULT_BACKEND_URL = 'http://localhost:3000';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';


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

  const tokens = (await response.json()) as TokensResponse;
  persistTokens(tokens);
  return tokens;
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

  const tokens = (await response.json()) as TokensResponse;
  persistTokens(tokens);
  return tokens;
}

export async function refreshTokens(): Promise<TokensResponse | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${getBackendBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const tokens = (await response.json()) as TokensResponse;
  persistTokens(tokens);
  return tokens;
}

export function persistTokens(tokens: TokensResponse): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  } catch (error) {
    console.error('Failed to persist tokens', error);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredTokens(): TokensResponse | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) {
    return null;
  }
  return { accessToken, refreshToken };
}

export function clearTokens(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to clear tokens', error);
  }
}

function getBackendBaseUrl(): string {
  return getEnv('NEXT_PUBLIC_BACKEND_URL', DEFAULT_BACKEND_URL);
}

function getEnv(name: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name] as string;
  }
  if (typeof window !== 'undefined') {
    const globalWithEnv = window as unknown as Record<string, string | undefined>;
    const fromWindow = globalWithEnv[name];
    if (fromWindow) {
      return fromWindow;
    }
  }
  return fallback;
}

async function extractErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    if (data && typeof data === 'object') {
      if (typeof (data as Record<string, unknown>).message === 'string') {
        return (data as Record<string, string>).message;
      }
      if (Array.isArray((data as Record<string, unknown>).message) && (data as { message: unknown[] }).message.length > 0) {
        return String((data as { message: unknown[] }).message[0]);
      }
      if (typeof (data as Record<string, unknown>).error === 'string') {
        return (data as Record<string, string>).error;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to parse error response', error);
    return null;
  }
}
