import type { ReactNode } from 'react';
import type { JSX } from 'react';

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl bg-background px-6 py-16 text-neutral-dark md:py-20 lg:px-10">
      {children}
    </main>
  );
}

