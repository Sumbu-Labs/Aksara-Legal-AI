'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { useAuth } from '@/components/auth/AuthProvider';

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Ringkasan' },
  { href: '/dashboard/ai-services', label: 'AI Services' },
  { href: '/dashboard/autopilot', label: 'Autopilot Izin' },
  { href: '/dashboard/documents', label: 'Dokumen' },
  { href: '/dashboard/settings', label: 'Pengaturan' },
];

export function DashboardShell({ children }: { children: ReactNode }): ReactElement {
  const pathname = usePathname();
  const { user, logout, isChecking } = useAuth();

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

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
                    className={`flex w-full items-center justify-between border-2 border-black px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-secondary/30 ${
                      isActive ? 'bg-primary text-white' : 'bg-white text-neutral-dark'
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
            href="/dashboard/settings/subscription"
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
            <span className="hidden border-2 border-black bg-secondary/40 px-4 py-2 uppercase tracking-[0.2em] md:inline-flex">
              Mode Demo
            </span>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-dark">Masuk sebagai</p>
              <p className="mt-1 text-base font-semibold text-neutral-dark">{user?.name ?? 'Pengguna'}</p>
              <p className="text-xs text-neutral-mid">{user?.email ?? 'Memuat akun...'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isChecking}
              className="border-2 border-black bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
            >
              Keluar
            </button>
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
