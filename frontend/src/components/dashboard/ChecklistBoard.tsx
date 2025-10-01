'use client';

import { PermitCard } from './PermitCard';
import type { PermitCardData } from './PermitCard';
import type { ReactElement } from 'react';


type ChecklistBoardProps = {
  items: PermitCardData[];
  onSelectPermit?: (permitId: string) => void;
  emptyMessage?: string;
};

export function ChecklistBoard({
  items,
  onSelectPermit,
  emptyMessage = 'Klik &quot;Buat Checklist&quot; untuk melihat izin yang direkomendasikan.',
}: ChecklistBoardProps): ReactElement {
  if (items.length === 0) {
    return (
      <div className="border-2 border-black bg-white px-6 py-12 text-center text-sm text-neutral-mid">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <PermitCard
          key={item.id}
          {...item}
          onClick={onSelectPermit}
        />
      ))}
    </div>
  );
}
