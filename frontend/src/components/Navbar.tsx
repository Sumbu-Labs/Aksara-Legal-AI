"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

import { useAuth } from '@/components/auth/AuthProvider';

export function Navbar() {
  const pathname = usePathname() ?? '';
  const { isAuthenticated, isChecking, user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    void logout();
  }, [logout]);

  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-heading tracking-wider uppercase">
          Aksara
        </Link>

        <nav className="hidden items-center gap-8 text-base font-semibold md:flex">
          <Link href="/#services" className="text-neutral-mid transition-colors hover:text-primary hover:underline">
            Layanan
          </Link>
          <Link href="/#how" className="text-neutral-mid transition-colors hover:text-primary hover:underline">
            Cara Kerja
          </Link>
          <Link href="/#testimonials" className="text-neutral-mid transition-colors hover:text-primary hover:underline">
            Testimonial
          </Link>
          <Link href="/#pricing" className="text-neutral-mid transition-colors hover:text-primary hover:underline">
            Harga
          </Link>
          <Link href="/#faq" className="text-neutral-mid transition-colors hover:text-primary hover:underline">
            FAQ
          </Link>
        </nav>

        <div className="ml-4 flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden text-right text-xs uppercase tracking-[0.2em] text-neutral-mid sm:block">
                <p className="font-semibold text-neutral-dark">
                  {user?.name ? `Hai, ${user.name.split(' ')[0]}` : 'Selamat Datang'}
                </p>
                <p className="mt-1 text-[11px] normal-case text-neutral-mid">{user?.email}</p>
              </div>
              <Link
                href="/dashboard"
                className="border-2 border-black bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-widest text-[var(--background)] transition-colors hover:bg-primary-dark"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isChecking}
                className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-mid transition-colors hover:text-primary disabled:cursor-not-allowed disabled:text-neutral-light"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/auth?mode=register"
              className="border-2 border-black bg-primary px-4 py-2 font-medium text-[var(--background)] transition-colors hover:bg-primary-dark"
            >
              Mulai Sekarang
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
