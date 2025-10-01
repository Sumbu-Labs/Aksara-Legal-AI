"use client";

import type { ReactNode } from 'react';
import type { JSX } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <AuthGuard fallback={<DashboardLoading />}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}

function DashboardLoading(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-neutral-mid" role="status" aria-live="polite">
        Mengautentikasi akun Anda...
      </p>
    </div>
  );
}

