'use client';

import type { TokensResponse } from './auth';
import { clearTokens, getAccessToken, getRefreshToken, refreshTokens } from './auth';

export interface AuthorizedFetchOptions extends RequestInit {
  retryOnUnauthorized?: boolean;
}

let refreshPromise: Promise<TokensResponse | null> | null = null;

export async function authorizedFetch(
  input: RequestInfo | URL,
  options: AuthorizedFetchOptions = {},
): Promise<Response> {
  const { retryOnUnauthorized = true, headers, credentials, ...rest } = options;

  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('Akses ditolak. Silakan login kembali.');
  }

  const requestHeaders = new Headers(headers ?? {});
  requestHeaders.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(input, {
    ...rest,
    credentials: credentials ?? 'include',
    headers: requestHeaders,
  });

  if (response.status !== 401 || !retryOnUnauthorized) {
    return response;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return response;
  }

  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;
  if (!refreshed) {
    clearTokens();
    return response;
  }

  return authorizedFetch(input, { ...options, retryOnUnauthorized: false });
}
