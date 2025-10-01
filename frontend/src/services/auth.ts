'use client';

const DEFAULT_BACKEND_URL = 'http://localhost:3000';
const TOKENS_STORAGE_KEY = 'aksara_auth_tokens';
const LEGACY_ACCESS_KEY = 'accessToken';
const LEGACY_REFRESH_KEY = 'refreshToken';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthSession = Tokens & {
  user: AuthenticatedUser;
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

export async function register(payload: RegisterPayload): Promise<AuthSession> {
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

  return (await response.json()) as AuthSession;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
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

  return (await response.json()) as AuthSession;
}

export async function refresh(refreshToken: string): Promise<AuthSession> {
  const response = await fetch(`${getBackendBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message || 'Sesi tidak lagi valid.');
  }

  return (await response.json()) as AuthSession;
}

export async function fetchAuthenticatedUser(accessToken: string): Promise<AuthenticatedUser> {
  const response = await fetch(`${getBackendBaseUrl()}/auth/check`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message || 'Gagal memverifikasi sesi.');
  }

  return (await response.json()) as AuthenticatedUser;
}

export async function revokeSession(accessToken: string | null | undefined): Promise<void> {
  if (!accessToken) {
    return;
  }

  try {
    await fetch(`${getBackendBaseUrl()}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
  } catch (error) {
    // ignore network errors during logout to keep UX smooth
    console.warn('Failed to revoke session on server', error);
  }
}

export function storeTokens(tokens: Tokens): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    window.localStorage.removeItem(LEGACY_ACCESS_KEY);
    window.localStorage.removeItem(LEGACY_REFRESH_KEY);
  } catch (error) {
    console.error('Failed to persist tokens', error);
  }
}

export function loadTokens(): Tokens | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(TOKENS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Tokens> | null;
      if (parsed?.accessToken && parsed?.refreshToken) {
        return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
      }
    }

    const legacyAccess = window.localStorage.getItem(LEGACY_ACCESS_KEY);
    const legacyRefresh = window.localStorage.getItem(LEGACY_REFRESH_KEY);
    if (legacyAccess && legacyRefresh) {
      const tokens: Tokens = { accessToken: legacyAccess, refreshToken: legacyRefresh };
      storeTokens(tokens);
      return tokens;
    }
  } catch (error) {
    console.error('Failed to read tokens from storage', error);
  }

  return null;
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(TOKENS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_ACCESS_KEY);
    window.localStorage.removeItem(LEGACY_REFRESH_KEY);
  } catch (error) {
    console.error('Failed to clear tokens from storage', error);
  }
}

export const persistTokens = storeTokens;

export type TokensResponse = AuthSession;

export function getAccessToken(): string | null {
  const tokens = loadTokens();
  return tokens?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  const tokens = loadTokens();
  return tokens?.refreshToken ?? null;
}

export function clearTokens(): void {
  clearStoredTokens();
}

export async function refreshTokens(): Promise<TokensResponse | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const session = await refresh(refreshToken);
    storeTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken });
    return session;
  } catch (error) {
    clearStoredTokens();
    console.warn('Failed to refresh session', error);
    return null;
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
