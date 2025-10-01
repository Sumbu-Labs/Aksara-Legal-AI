import Link from 'next/link';
import type { ReactElement } from 'react';

const SETTINGS_LINKS = [
  {
    href: '/dashboard/settings/profile',
    title: 'Profil Akun',
    description:
      'Atur nama lengkap, email, dan informasi akun lain yang digunakan untuk masuk ke Aksara Legal AI.',
  },
  {
    href: '/dashboard/settings/business',
    title: 'Profil Bisnis',
    description:
      'Perbarui detail bisnis yang memengaruhi rekomendasi checklist izin dan dokumen otomatis.',
  },
  {
    href: '/dashboard/settings/subscription',
    title: 'Langganan',
    description:
      'Lihat status paket Anda, riwayat pembayaran, serta opsi upgrade atau manajemen langganan.',
  },
];

export default function DashboardSettingsPage(): ReactElement {
  return (
    <div className="flex flex-col gap-12">
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Pengaturan</p>
        <h1 className="mt-4 font-heading text-4xl text-neutral-dark">Kelola Akun & Bisnis</h1>
        <p className="mt-3 max-w-2xl text-base text-neutral-mid">
          Semua kontrol penting tersedia di satu tempat. Perbarui profil Anda, sinkronkan data bisnis, dan pastikan paket langganan tetap sesuai kebutuhan organisasi.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {SETTINGS_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex h-full flex-col justify-between border-2 border-black bg-white px-6 py-6 text-left transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Shortcut</p>
              <h2 className="font-heading text-2xl text-neutral-dark">{item.title}</h2>
              <p className="text-sm text-neutral-mid">{item.description}</p>
            </div>
            <span className="mt-8 inline-flex items-center text-sm font-semibold uppercase tracking-[0.2em] text-neutral-dark">
              Kelola Sekarang <span aria-hidden="true" className="ml-3">→</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
