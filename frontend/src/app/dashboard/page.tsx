'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';


import { ChecklistBoard } from '@/components/dashboard/ChecklistBoard';
import { CreateChecklistButton } from '@/components/dashboard/CreateChecklistButton';
import type { PermitCardData } from '@/components/dashboard/PermitCard';
import { useToast } from '@/components/ToastProvider';
import type { BusinessProfileFormValues } from '@/components/onboarding/BusinessProfileForm';
import { BUSINESS_SIZE_LABEL } from '@/components/onboarding/BusinessProfileForm';

const STORAGE_KEY = 'aksara_business_profile';

const INITIAL_PERMITS: PermitCardData[] = [
  {
    id: 'halal',
    title: 'Sertifikasi Halal BPJPH',
    description:
      'Wajib bagi produk makanan/minuman untuk memastikan bahan dan proses produksi sesuai standar halal nasional.',
    estimatedDuration: '21-35 hari kerja',
    requiredDocuments: 6,
    status: 'not_started',
    nextAction: 'Siapkan data profil pabrik',
  },
  {
    id: 'pirt',
    title: 'Izin PIRT',
    description:
      'Perizinan dari Dinas Kesehatan untuk pangan olahan rumah tangga sebelum dipasarkan ke masyarakat.',
    estimatedDuration: '14-21 hari kerja',
    requiredDocuments: 5,
    status: 'not_started',
    nextAction: 'Kumpulkan bukti produksi dan kemasan',
  },
  {
    id: 'bpom',
    title: 'Izin Edar BPOM MD',
    description:
      'Diperlukan untuk produksi skala menengah ke atas agar produk terdaftar resmi dan bebas distribusi nasional.',
    estimatedDuration: '30-45 hari kerja',
    requiredDocuments: 8,
    status: 'not_started',
    nextAction: 'Audit kesiapan fasilitas produksi',
  },
];

export default function DashboardPage(): ReactElement {
  const router = useRouter();
  const toast = useToast();

  const [profile, setProfile] = useState<BusinessProfileFormValues | null>(null);
  const [permits, setPermits] = useState<PermitCardData[]>(INITIAL_PERMITS);
  const [hasChecklist, setHasChecklist] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BusinessProfileFormValues;
        setProfile(parsed);
      }
    } catch (error) {
      console.warn('Gagal membaca data profil bisnis dari penyimpanan lokal.', error);
    }
  }, []);

  const formattedBusinessSize = useMemo(() => {
    if (!profile) {
      return '-';
    }
    return BUSINESS_SIZE_LABEL[profile.businessSize] ?? profile.businessSize;
  }, [profile]);

  const handleGenerateChecklist = useCallback(() => {
    setHasChecklist(true);
    setLastGeneratedAt(
      new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    );

    setPermits((previous) =>
      previous.map((item, index) => ({
        ...item,
        status: index === 0 ? 'ready' : 'in_progress',
        nextAction: 'Lihat detail izin',
      })),
    );

    toast.success('Checklist berhasil dibuat! Mulai dari izin dengan status siap diajukan.');
  }, [toast]);

  const handleSelectPermit = useCallback(
    (permitId: string) => {
      toast.info('Membuka detail izin.');
      router.push(`/izin/${permitId}`);
    },
    [router, toast],
  );

  const checklistStatusLabel = useMemo(() => {
    if (!hasChecklist) {
      return 'Belum dibuat';
    }
    return lastGeneratedAt ? `Diperbarui ${lastGeneratedAt}` : 'Siap digunakan';
  }, [hasChecklist, lastGeneratedAt]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl bg-background px-6 py-16 text-neutral-dark md:py-20 lg:px-10">
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Dashboard</p>
        <h1 className="mt-4 font-heading text-4xl text-neutral-dark">
          Halo, {profile?.businessName ?? 'Founder Aksara'}!
        </h1>
        <p className="mt-3 max-w-2xl text-base text-neutral-mid">
          Inilah pusat kendali kepatuhan Anda. Buat checklist personal, pantau progres, dan delegasikan dokumen rumit ke Aksara Autopilot.
        </p>
      </header>

      <section className="border-b-2 border-black py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <h2 className="font-heading text-3xl text-neutral-dark">Ringkasan Bisnis</h2>
            <div className="border-2 border-black bg-white">
              <dl className="divide-y-2 divide-black/20">
                <div className="flex items-center justify-between gap-6 px-6 py-4 text-sm">
                  <dt className="font-semibold uppercase tracking-[0.2em] text-neutral-mid">Nama Bisnis</dt>
                  <dd className="text-base text-neutral-dark">{profile?.businessName ?? 'Belum diisi'}</dd>
                </div>
                <div className="flex items-center justify-between gap-6 px-6 py-4 text-sm">
                  <dt className="font-semibold uppercase tracking-[0.2em] text-neutral-mid">Jenis Usaha</dt>
                  <dd className="text-base text-neutral-dark">{profile?.businessType ?? 'Belum diisi'}</dd>
                </div>
                <div className="flex items-center justify-between gap-6 px-6 py-4 text-sm">
                  <dt className="font-semibold uppercase tracking-[0.2em] text-neutral-mid">Skala Operasi</dt>
                  <dd className="text-base text-neutral-dark">{formattedBusinessSize}</dd>
                </div>
                <div className="flex items-center justify-between gap-6 px-6 py-4 text-sm">
                  <dt className="font-semibold uppercase tracking-[0.2em] text-neutral-mid">Domisili</dt>
                  <dd className="text-base text-neutral-dark">{profile?.businessLocation ?? 'Belum diisi'}</dd>
                </div>
                <div className="flex flex-col gap-2 px-6 py-4 text-sm">
                  <dt className="font-semibold uppercase tracking-[0.2em] text-neutral-mid">Produk Utama</dt>
                  <dd className="text-base text-neutral-dark">{profile?.mainProducts ?? 'Belum diisi'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="border-2 border-black bg-secondary/40 px-6 py-6">
              <h3 className="font-heading text-2xl text-neutral-dark">Status Checklist</h3>
              <p className="mt-2 text-sm text-neutral-mid">
                {hasChecklist
                  ? 'Checklist Anda siap digunakan. Periksa izin prioritas dan tandai progres setiap langkah.'
                  : 'Belum ada checklist aktif. Mulai dengan menekan tombol di bawah untuk memetakan izin yang relevan.'}
              </p>
              <div className="mt-4 border-t-2 border-black pt-4 text-sm text-neutral-dark">
                <span className="font-semibold text-primary-dark">{checklistStatusLabel}</span>
              </div>
            </div>

            <CreateChecklistButton onClick={handleGenerateChecklist} />
          </div>
        </div>
      </section>

      <section className="border-b-2 border-black py-12">
        <header className="mb-8 flex flex-col gap-3">
          <h2 className="font-heading text-3xl text-neutral-dark">Checklist Rekomendasi</h2>
          <p className="max-w-2xl text-sm text-neutral-mid">
            Kami memprioritaskan izin yang paling berdampak pada operasional Anda. Klik kartu untuk melihat detail langkah, dokumen pendukung, dan akses ke Asisten AI.
          </p>
        </header>
        <ChecklistBoard items={permits} onSelectPermit={handleSelectPermit} />
      </section>

      <section className="py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="border-2 border-black bg-white px-6 py-6">
            <h2 className="font-heading text-3xl text-neutral-dark">Aksara Autopilot</h2>
            <p className="mt-3 text-sm text-neutral-mid">
              Setelah checklist siap, gunakan Autopilot untuk menghasilkan draf dokumen secara otomatis. Kami akan mengisi formulir dan surat permohonan berdasar profil bisnis yang baru saja Anda lengkapi.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-neutral-dark">
              <li className="flex items-start gap-3">
                <span className="font-semibold text-primary-dark">01</span>
                <span>Unggah dokumen pendukung (NIB, KTP, sertifikat halal bahan baku).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-primary-dark">02</span>
                <span>Pilih izin dari checklist dan klik &quot;Buatkan Draf Dokumen&quot;.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-primary-dark">03</span>
                <span>Tinjau hasilnya, lakukan penyesuaian kecil, dan siap untuk diajukan.</span>
              </li>
            </ul>
          </div>

          <div className="border-2 border-black bg-secondary/40 px-6 py-6 text-sm text-neutral-dark">
            <h3 className="font-heading text-2xl text-neutral-dark">Tips Cepat</h3>
            <ul className="mt-4 space-y-3">
              <li>
                Tandai setiap langkah checklist setelah selesai untuk memantau progres tim Anda.
              </li>
              <li>
                Gunakan chat AI untuk meminta klarifikasi regulasi sebelum mengirim dokumen.
              </li>
              <li>
                Upgrade ke paket Pro untuk akses generate dokumen tanpa batas.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
