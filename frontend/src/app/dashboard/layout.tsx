import type { ReactNode } from 'react';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import type { JSX } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <DashboardShell>{children}</DashboardShell>;
}

