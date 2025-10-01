import type { ReactElement, ReactNode } from 'react';

import { Navbar } from '@/components/Navbar';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-background text-neutral-dark">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
