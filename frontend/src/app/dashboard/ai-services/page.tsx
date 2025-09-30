import Link from 'next/link';
import type { JSX } from 'react';

import { listPermits } from '@/data/permits';

export default function DashboardAiServicesPage(): JSX.Element {
  const permits = listPermits();

  return (
    <main className="mx-auto w-full max-w-6xl px-8 py-12 text-neutral-dark">
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">AI Services</p>
        <h1 className="mt-4 font-heading text-4xl text-neutral-dark">Pusat Asisten AI</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-mid">
          Pilih izin yang ingin Anda dalami. Asisten AI kami memberikan jawaban kontekstual lengkap dengan referensi regulasi sehingga tim Anda dapat mengambil keputusan dengan percaya diri.
        </p>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        {permits.map((permit) => (
          <article
            key={permit.slug}
            className="flex h-full flex-col gap-5 border-2 border-black bg-white px-6 py-6 shadow-card transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="inline-flex w-fit items-center rounded-full border-2 border-black bg-secondary/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-mid">
              {permit.shortName}
            </span>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl text-neutral-dark">Asisten AI: {permit.name}</h2>
              <p className="text-sm leading-relaxed text-neutral-mid">{permit.summary}</p>
            </div>
            <ul className="flex flex-1 list-disc flex-col gap-2 pl-5 text-sm text-neutral-mid">
              {permit.samplePrompts.slice(0, 2).map((prompt) => (
                <li key={prompt} className="marker:text-primary">
                  {prompt}
                </li>
              ))}
            </ul>
            <Link
              href={`/izin/${permit.slug}`}
              className="inline-flex items-center justify-center border-2 border-black bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark"
            >
              Buka Asisten AI
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-12 border-2 border-black bg-secondary/40 px-6 py-8 text-sm text-neutral-mid">
        <h2 className="font-heading text-2xl text-neutral-dark">Tips Menggunakan Asisten AI</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          <li className="border border-black/10 bg-white/70 px-4 py-3">
            Gunakan konteks spesifik usaha Anda (jenis produk, lokasi, status izin) agar jawaban lebih relevan.
          </li>
          <li className="border border-black/10 bg-white/70 px-4 py-3">
            Tanyakan langkah-langkah selanjutnya setelah menerima jawaban untuk menjaga progres checklist.
          </li>
          <li className="border border-black/10 bg-white/70 px-4 py-3">
            Simpan tautan regulasi yang direferensikan untuk dokumentasi audit internal.
          </li>
        </ul>
      </section>
    </main>
  );
}
