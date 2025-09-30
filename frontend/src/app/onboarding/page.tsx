'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { JSX } from 'react';


import { BusinessProfileForm } from '@/components/onboarding/BusinessProfileForm';
import type { BusinessProfileFormValues } from '@/components/onboarding/BusinessProfileForm';
import { useToast } from '@/components/ToastProvider';

const STORAGE_KEY = 'aksara_business_profile';

export default function OnboardingPage(): JSX.Element {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values: BusinessProfileFormValues) => {
      setIsSubmitting(true);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        }
        await new Promise((resolve) => setTimeout(resolve, 450));
        toast.success('Profil bisnis tersimpan. Checklist akan siap dalam sekejap.');
        router.push('/dashboard');
      } catch (error) {
        const message = error instanceof Error ? error.message : null;
        toast.error(message ?? 'Gagal menyimpan profil. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, toast],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 bg-background px-6 py-16 text-neutral-dark md:py-20 lg:px-10">
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Onboarding</p>
        <h1 className="mt-4 font-heading text-4xl text-neutral-dark">
          Lengkapi Profil Bisnis Anda
        </h1>
        <p className="mt-3 max-w-2xl text-base text-neutral-mid">
          Kami menggunakan informasi bisnis ini untuk mempersonalisasi checklist izin, rekomendasi dokumen, dan langkah tindak lanjut sehingga Anda tidak lagi kebingungan mengurus kepatuhan.
        </p>
      </header>

      <div className="grid gap-10 pb-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <BusinessProfileForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <aside className="flex flex-col gap-6 border-2 border-black bg-secondary/40 p-6 text-sm">
          <section className="space-y-2">
            <h2 className="font-heading text-2xl text-neutral-dark">Apa selanjutnya?</h2>
            <p className="text-neutral-mid">
              Setelah profil bisnis tersimpan, kami akan menyiapkan rekomendasi izin prioritas dan checklist langkah-langkah yang dapat langsung Anda jalankan.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-dark">
              Tiga Langkah Menuju Kepatuhan
            </h3>
            <ol className="space-y-3">
              <li className="border-b-2 border-black pb-3">
                <p className="font-semibold text-neutral-dark">1. Lengkapi Profil Bisnis</p>
                <p className="text-neutral-mid">Data dasar usaha Anda memastikan aturan yang kami tampilkan relevan.</p>
              </li>
              <li className="border-b-2 border-black pb-3">
                <p className="font-semibold text-neutral-dark">2. Review Checklist Rekomendasi</p>
                <p className="text-neutral-mid">Dashboard akan menampilkan kartu izin (Halal, PIRT, BPOM) lengkap dengan status dan tenggat.</p>
              </li>
              <li>
                <p className="font-semibold text-neutral-dark">3. Serahkan Pada Aksara Autopilot</p>
                <p className="text-neutral-mid">Gunakan Autopilot untuk mengisi dokumen rumit secara instan berdasarkan profil yang Anda set.</p>
              </li>
            </ol>
          </section>

          <section className="space-y-2 border-t-2 border-black pt-4">
            <h3 className="font-semibold text-neutral-dark">Butuh bantuan?</h3>
            <p className="text-neutral-mid">
              Ajukan pertanyaan kapan saja lewat chat AI kami atau hubungi tim Aksara di <span className="font-semibold text-neutral-dark">support@aksaralegal.ai</span>.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

