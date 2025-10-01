'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import {
  clearStoredTokens,
  fetchAuthenticatedUser,
  loadTokens,
  login as loginRequest,
  refresh as refreshSessionRequest,
  register as registerRequest,
  revokeSession,
  storeTokens,
} from '@/services/auth';
import type {
  AuthSession,
  AuthenticatedUser,
  LoginPayload,
  RegisterPayload,
  Tokens,
} from '@/services/auth';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthenticatedUser | null;
  tokens: Tokens | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isChecking: boolean;
  login: (payload: LoginPayload) => Promise<AuthenticatedUser>;
  register: (payload: RegisterPayload) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthSession | null> | null>(null);

  const applySession = useCallback((session: AuthSession) => {
    const nextTokens: Tokens = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };
    storeTokens(nextTokens);
    setTokens(nextTokens);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setTokens(null);
    clearStoredTokens();
    setStatus('unauthenticated');
  }, []);

  const refreshSession = useCallback(
    async (overrideToken?: string) => {
      const refreshToken = overrideToken ?? tokens?.refreshToken;
      if (!refreshToken) {
        clearSession();
        return null;
      }

      if (!refreshPromiseRef.current) {
        refreshPromiseRef.current = refreshSessionRequest(refreshToken)
          .then((session) => {
            applySession(session);
            return session;
          })
          .catch((error) => {
            clearSession();
            throw error;
          })
          .finally(() => {
            refreshPromiseRef.current = null;
          });
      }

      return refreshPromiseRef.current;
    },
    [applySession, clearSession, tokens?.refreshToken],
  );

  const bootstrap = useCallback(async () => {
    const storedTokens = loadTokens();
    if (!storedTokens) {
      clearSession();
      return;
    }

    setTokens(storedTokens);

    try {
      const authenticatedUser = await fetchAuthenticatedUser(storedTokens.accessToken);
      storeTokens(storedTokens);
      setUser(authenticatedUser);
      setStatus('authenticated');
    } catch {
      try {
        await refreshSession(storedTokens.refreshToken);
      } catch {
        clearSession();
      }
    }
  }, [clearSession, refreshSession]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginRequest(payload);
      applySession(session);
      return session.user;
    },
    [applySession],
  );

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      const session = await registerRequest(payload);
      applySession(session);
      return session.user;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const accessToken = tokens?.accessToken ?? null;
    clearSession();
    await revokeSession(accessToken);
  }, [clearSession, tokens?.accessToken]);

  const contextValue = useMemo<AuthContextValue>(() => {
    const isAuthenticated = status === 'authenticated';
    const isChecking = status === 'checking';

    return {
      user,
      tokens,
      status,
      isAuthenticated,
      isChecking,
      login: handleLogin,
      register: handleRegister,
      logout,
      refreshSession,
    };
  }, [handleLogin, handleRegister, logout, refreshSession, status, tokens, user]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
