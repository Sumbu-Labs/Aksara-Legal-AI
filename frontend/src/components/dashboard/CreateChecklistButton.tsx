'use client';

import type { JSX } from 'react';


type CreateChecklistButtonProps = {
  onClick?: () => void;
  label?: string;
  subtitle?: string;
};

export function CreateChecklistButton({
  onClick,
  label = 'Buat Checklist Kepatuhan',
  subtitle = 'Aksara akan memetakan izin prioritas dan dokumen yang perlu disiapkan.',
}: CreateChecklistButtonProps): JSX.Element {
  return (
    <div className="space-y-4 border-2 border-black bg-white px-6 py-6">
      <div>
        <h3 className="font-heading text-2xl text-neutral-dark">Mulai Analisis Kepatuhan</h3>
        <p className="mt-2 text-sm text-neutral-mid">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex w-full items-center justify-between gap-4 rounded-full border-2 border-black bg-primary px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:outline-none"
      >
        <span>{label}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

