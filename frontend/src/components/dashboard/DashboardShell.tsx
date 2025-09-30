'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { JSX } from 'react';

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Ringkasan' },
  { href: '/dashboard/documents', label: 'Dokumen' },
];

export function DashboardShell({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-neutral-dark">
      <aside className="sticky top-0 flex h-full w-[260px] min-w-[240px] flex-col border-r-2 border-black bg-white">
        <div className="border-b-2 border-black px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Aksara Legal AI</p>
          <h1 className="mt-3 font-heading text-3xl text-neutral-dark">Control Center</h1>
          <p className="mt-2 text-xs text-neutral-mid">
            Monitor checklist, dokumen, dan Autopilot dari satu tempat.
          </p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => {
              const isActive = isRouteActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex w-full items-center justify-between border-2 border-black px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${
                      isActive ? 'bg-primary text-white' : 'bg-white text-neutral-dark hover:bg-secondary/30'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t-2 border-black px-6 py-6 text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-neutral-mid">Plan Anda</p>
          <p className="mt-2 text-base text-neutral-dark">Gratis</p>
          <p className="mt-2 text-xs text-neutral-mid">
            Upgrade untuk akses tak terbatas ke Aksara Autopilot dan dukungan prioritas.
          </p>
          <Link
            href="/upgrade"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border-2 border-black bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Upgrade Paket
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b-2 border-black bg-white px-8 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Dashboard Internal</p>
            <p className="mt-2 text-sm text-neutral-mid">
              Kelola progres perizinan bisnis Anda dan delegasikan tugas administratif.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-dark">
            <span className="border-2 border-black bg-secondary/40 px-4 py-2 uppercase tracking-[0.2em]">
              Mode Demo
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function isRouteActive(currentPath: string, targetPath: string): boolean {
  if (currentPath === targetPath) {
    return true;
  }
  if (targetPath === '/dashboard') {
    return false;
  }
  return currentPath.startsWith(`${targetPath}/`);
}
