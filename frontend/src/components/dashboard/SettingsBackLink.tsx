'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

type SettingsBackLinkProps = {
  label?: string;
};

export function SettingsBackLink({ label = 'Kembali ke Pengaturan' }: SettingsBackLinkProps): ReactElement {
  return (
    <Link
      href="/dashboard/settings"
      className="inline-flex items-center gap-2 self-start rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-dark transition-colors hover:bg-secondary/40"
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  );
}
