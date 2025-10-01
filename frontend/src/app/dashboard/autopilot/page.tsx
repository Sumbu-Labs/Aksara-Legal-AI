import Link from 'next/link';
import type { ReactElement } from 'react';

import { listPermits } from '@/data/permits';

const AUTOPILOT_STEPS = [
  {
    number: '01',
    title: 'Pastikan profil bisnis lengkap',
    description:
      'Autopilot menggunakan data usaha Anda untuk mengisi formulir. Periksa kembali informasi di menu Pengaturan > Profil Bisnis.',
  },
  {
    number: '02',
    title: 'Unggah dokumen pendukung',
    description:
      'Masuk ke tab Dokumen dan unggah file penting seperti NIB, KTP pemilik, data produk, serta sertifikat pendukung lain.',
  },
  {
    number: '03',
    title: 'Pilih izin dan generate draf',
    description:
      'Buka izin terkait dan klik tombol “Buatkan Draf Dokumen”. Autopilot menyiapkan file siap edit dalam hitungan menit.',
  },
];

export default function DashboardAutopilotPage(): ReactElement {
  const permits = listPermits();

  return (
    <main className="mx-auto w-full max-w-6xl px-8 py-12 text-neutral-dark">
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Autopilot Izin</p>
        <h1 className="mt-4 font-heading text-4xl text-neutral-dark">Automasi Dokumen Perizinan</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-mid">
          Autopilot mengubah data bisnis Anda menjadi draf surat permohonan dan formulir resmi secara otomatis. Gunakan fitur ini untuk mempersingkat persiapan administrasi hingga 80%.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {AUTOPILOT_STEPS.map((step) => (
          <article
            key={step.number}
            className="flex h-full flex-col gap-4 border-2 border-black bg-white px-6 py-6 shadow-card"
          >
            <span className="text-lg font-semibold text-primary">{step.number}</span>
            <h2 className="font-heading text-2xl text-neutral-dark">{step.title}</h2>
            <p className="text-sm leading-relaxed text-neutral-mid">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 border-2 border-black bg-secondary/40 px-6 py-8">
        <h2 className="font-heading text-2xl text-neutral-dark">Izin yang Didukung</h2>
        <p className="mt-3 max-w-3xl text-sm text-neutral-mid">
          Autopilot siap digunakan untuk izin prioritas berikut. Setiap draf mencakup data usaha, ringkasan produk, serta lampiran yang diwajibkan regulator.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {permits.map((permit) => (
            <div key={permit.slug} className="flex flex-col gap-3 border border-black/20 bg-white px-5 py-5">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{permit.shortName}</span>
              <p className="font-heading text-xl text-neutral-dark">{permit.name}</p>
              <p className="text-sm text-neutral-mid">{permit.heroTagline}</p>
              <Link
                href={`/izin/${permit.slug}`}
                className="inline-flex w-fit items-center justify-center border-2 border-black bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary-dark"
              >
                Buka Detail Izin
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 flex flex-col gap-4 border-2 border-black bg-white px-6 py-8 text-sm text-neutral-mid md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-heading text-2xl text-neutral-dark">Siapkan Dokumen Pendukung</h2>
          <p>
            Kelola dan unggah seluruh lampiran penting melalui modul Dokumen. Autopilot otomatis mengaitkan file yang relevan ke formulir yang digenerate.
          </p>
        </div>
        <Link
          href="/dashboard/documents"
          className="inline-flex items-center justify-center border-2 border-black bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-dark transition-colors hover:bg-secondary"
        >
          Kelola Dokumen
        </Link>
      </section>
    </main>
  );
}
