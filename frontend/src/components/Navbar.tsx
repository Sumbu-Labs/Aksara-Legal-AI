"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname() ?? '';

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

        <div className="ml-4">
          <Link
            href="/auth"
            className="border-2 border-black bg-primary px-4 py-2 font-medium text-[var(--background)]"
          >
            Mulai Sekarang
          </Link>
        </div>
      </div>
    </header>
  );
}
