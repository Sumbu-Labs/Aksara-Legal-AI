'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { SettingsBackLink } from '@/components/dashboard/SettingsBackLink';

const CURRENT_PLAN = {
  name: 'Gratis',
  price: 'Rp0/bulan',
  features: [
    'Checklist rekomendasi untuk 3 izin prioritas',
    'Autopilot terbatas untuk uji coba dokumen',
    'Notifikasi email ringkasan mingguan',
  ],
  upgradeCta: {
    label: 'Upgrade ke Scale',
    href: '/upgrade',
  },
  renewalDate: '28 Maret 2024',
  status: 'Aktif',
};

const BILLING_HISTORY = [
  {
    id: 'inv-20240228',
    period: 'Februari 2024',
    amount: 'Rp0',
    status: 'Gratis',
    issuedAt: '28 Feb 2024',
  },
  {
    id: 'inv-20240128',
    period: 'Januari 2024',
    amount: 'Rp0',
    status: 'Gratis',
    issuedAt: '28 Jan 2024',
  },
];

export default function SubscriptionSettingsPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-10">
      <SettingsBackLink />
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Pengaturan • Langganan</p>
        <h1 className="mt-4 font-heading text-3xl text-neutral-dark">Status Langganan</h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-mid">
          Pantau paket aktif, riwayat penagihan, dan opsi upgrade untuk membuka fitur Aksara Autopilot tanpa batas.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="border-2 border-black bg-white px-6 py-8">
          <div className="flex flex-col gap-3 border-b-2 border-black pb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Paket Saat Ini</span>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-heading text-3xl text-neutral-dark">{CURRENT_PLAN.name}</h2>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-mid">
                {CURRENT_PLAN.status} • Perpanjangan {CURRENT_PLAN.renewalDate}
              </p>
            </div>
            <p className="text-lg font-semibold text-neutral-dark">{CURRENT_PLAN.price}</p>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-neutral-dark">
            {CURRENT_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 border-t-2 border-black pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-neutral-mid">
              Butuh kapasitas lebih? Aktifkan paket Scale untuk akses workflow otomatis dan dukungan prioritas.
            </p>
            <Link
              href={CURRENT_PLAN.upgradeCta.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-black bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-dark"
            >
              {CURRENT_PLAN.upgradeCta.label}
            </Link>
          </div>
        </div>

        <aside className="flex flex-col gap-6 border-2 border-black bg-secondary/40 px-6 py-8 text-sm text-neutral-dark">
          <div>
            <h3 className="font-heading text-2xl text-neutral-dark">Autopilot Tanpa Batas</h3>
            <p className="mt-2 text-neutral-mid">
              Paket Scale menambahkan kuota Autopilot untuk seluruh izin prioritas, workspace kolaboratif, dan SLA dukungan 12 jam.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Hubungi Tim Penjualan</h4>
            <p className="mt-2 text-neutral-mid">
              Perlu simulasi ROI atau proforma invoice? Email <span className="font-semibold text-neutral-dark">sales@aksaralegal.ai</span> atau chat langsung dari dashboard.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Pembayaran Terakhir</h4>
            <p className="mt-2 text-neutral-mid">
              Tidak ada penagihan aktif untuk paket gratis. Riwayat penagihan akan muncul saat Anda meng-upgrade.
            </p>
          </div>
        </aside>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl text-neutral-dark">Riwayat Penagihan</h2>
          <p className="text-sm text-neutral-mid">
            Riwayat ini disinkronkan otomatis dengan sistem penagihan kami. Unduh invoice dari daftar berikut.
          </p>
        </header>

        <div className="overflow-hidden border-2 border-black bg-white">
          <table className="min-w-full text-left text-sm text-neutral-dark">
            <thead className="bg-secondary/40 uppercase tracking-[0.2em] text-xs text-neutral-mid">
              <tr>
                <th className="border-b-2 border-black px-6 py-4">Periode</th>
                <th className="border-b-2 border-black px-6 py-4">Jumlah</th>
                <th className="border-b-2 border-black px-6 py-4">Status</th>
                <th className="border-b-2 border-black px-6 py-4">Tanggal Terbit</th>
                <th className="border-b-2 border-black px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {BILLING_HISTORY.map((entry) => (
                <tr key={entry.id} className="odd:bg-white even:bg-secondary/10">
                  <td className="border-b border-black/20 px-6 py-4 font-semibold">{entry.period}</td>
                  <td className="border-b border-black/20 px-6 py-4">{entry.amount}</td>
                  <td className="border-b border-black/20 px-6 py-4">{entry.status}</td>
                  <td className="border-b border-black/20 px-6 py-4">{entry.issuedAt}</td>
                  <td className="border-b border-black/20 px-6 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center border-2 border-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-secondary/30"
                    >
                      Unduh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
