'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import { BusinessProfileForm } from '@/components/onboarding/BusinessProfileForm';
import type { BusinessProfileFormValues } from '@/components/onboarding/BusinessProfileForm';
import { SettingsBackLink } from '@/components/dashboard/SettingsBackLink';
import { useToast } from '@/components/ToastProvider';

const STORAGE_KEY = 'aksara_business_profile';
const UPDATED_AT_KEY = 'aksara_business_profile_updated_at';

function formatUpdatedTimestamp(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function BusinessProfileSettingsPage(): JSX.Element {
  const toast = useToast();
  const [initialValues, setInitialValues] = useState<BusinessProfileFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const storedProfile = window.localStorage.getItem(STORAGE_KEY);
      if (storedProfile) {
        setInitialValues(JSON.parse(storedProfile) as BusinessProfileFormValues);
      }
      const storedTimestamp = window.localStorage.getItem(UPDATED_AT_KEY);
      if (storedTimestamp) {
        setLastSavedAt(storedTimestamp);
      }
    } catch (error) {
      console.warn('Gagal memuat profil bisnis dari penyimpanan lokal.', error);
    }
  }, []);

  const formattedTimestamp = useMemo(() => formatUpdatedTimestamp(lastSavedAt), [lastSavedAt]);

  const handleSubmit = useCallback(
    async (values: BusinessProfileFormValues) => {
      setIsSubmitting(true);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
          const timestamp = new Date().toISOString();
          window.localStorage.setItem(UPDATED_AT_KEY, timestamp);
          setLastSavedAt(timestamp);
        }
        await new Promise((resolve) => setTimeout(resolve, 400));
        setInitialValues({ ...values });
        toast.success('Profil bisnis tersimpan. Checklist akan diperbarui sesuai data terbaru.');
      } catch (error) {
        console.error('Gagal memperbarui profil bisnis.', error);
        toast.error('Tidak dapat menyimpan profil bisnis. Silakan coba ulang.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast],
  );

  return (
    <div className="flex flex-col gap-10">
      <SettingsBackLink />
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Pengaturan • Bisnis</p>
        <h1 className="mt-4 font-heading text-3xl text-neutral-dark">Profil Bisnis</h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-mid">
          Update data usaha ketika ada perubahan struktur, lokasi, atau produk. Kami menggunakan informasi ini untuk menyesuaikan rekomendasi izin dan dokumen otomatis Anda.
        </p>
        {formattedTimestamp && (
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-neutral-mid">
            Terakhir diperbarui: <span className="text-neutral-dark">{formattedTimestamp}</span>
          </p>
        )}
      </header>

      <BusinessProfileForm
        initialValues={initialValues ?? undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
