'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';

import { useAuth } from './AuthProvider';

type AuthGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function AuthGuard({ children, fallback }: AuthGuardProps): ReactElement | null {
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextParam = useMemo(() => {
    if (!pathname) {
      return null;
    }

    const search = searchParams?.toString();
    if (search && search.length > 0) {
      return `${pathname}?${search}`;
    }

    return pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const params = new URLSearchParams();
      params.set('mode', 'login');
      if (nextParam) {
        params.set('next', nextParam);
      }
      router.replace(`/auth?${params.toString()}`);
    }
  }, [nextParam, router, status]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-neutral-mid" role="status" aria-live="polite">
        Memuat data autentikasi...
      </p>
    </div>
  );
}
