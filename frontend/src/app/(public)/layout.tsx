import type { ReactNode } from 'react';

import { Navbar } from '@/components/Navbar';
import type { JSX } from 'react';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background text-neutral-dark">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

