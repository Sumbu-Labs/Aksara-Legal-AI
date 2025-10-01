"use client";

import type { ReactElement, ReactNode } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <AuthGuard fallback={<DashboardLoading />}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}

function DashboardLoading(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-neutral-mid" role="status" aria-live="polite">
        Mengautentikasi akun Anda...
      </p>
    </div>
  );
}
