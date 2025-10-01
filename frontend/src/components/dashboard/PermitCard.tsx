'use client';

import { useCallback } from 'react';
import type { ReactElement } from 'react';


export type PermitStatus = 'not_started' | 'in_progress' | 'ready';

export type PermitCardData = {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  requiredDocuments: number;
  status: PermitStatus;
  nextAction?: string;
};

type PermitCardProps = PermitCardData & {
  onClick?: (permitId: string) => void;
};

const STATUS_META: Record<PermitStatus, { label: string; chipClass: string }> = {
  not_started: {
    label: 'Belum Dimulai',
    chipClass: 'bg-white text-neutral-dark border-neutral-dark',
  },
  in_progress: {
    label: 'Dalam Proses',
    chipClass: 'bg-warning text-neutral-dark border-neutral-dark',
  },
  ready: {
    label: 'Siap Diajukan',
    chipClass: 'bg-success text-white border-neutral-dark',
  },
};

export function PermitCard({
  id,
  title,
  description,
  estimatedDuration,
  requiredDocuments,
  status,
  nextAction,
  onClick,
}: PermitCardProps): ReactElement {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(id);
    }
  }, [id, onClick]);

  const statusMeta = STATUS_META[status];

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-full w-full flex-col justify-between rounded-none border-2 border-black bg-white px-6 py-6 text-left transition-colors hover:bg-secondary/30 focus:outline-none focus-visible:outline-none"
    >
      <div className="space-y-4">
        <header className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-2xl text-neutral-dark">{title}</h3>
          <span
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusMeta.chipClass}`}
          >
            {statusMeta.label}
          </span>
        </header>
        <p className="text-sm text-neutral-mid">{description}</p>
      </div>

      <div className="mt-6 space-y-3 border-t-2 border-black pt-4 text-sm text-neutral-dark">
        <div className="flex items-center justify-between">
          <span>Kelengkapan</span>
          <span>{requiredDocuments} dokumen wajib</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimasi durasi</span>
          <span>{estimatedDuration}</span>
        </div>
        {nextAction ? (
          <div className="flex items-center justify-between text-primary">
            <span>{nextAction}</span>
            <span aria-hidden="true">→</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}
