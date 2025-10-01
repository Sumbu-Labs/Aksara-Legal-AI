'use client';

import type { FormEvent, ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useToast } from '@/components/ToastProvider';
import { SettingsBackLink } from '@/components/dashboard/SettingsBackLink';

const PROFILE_STORAGE_KEY = 'aksara_user_profile';
const PASSWORD_STORAGE_KEY = 'aksara_user_password_hash';

type ProfileFormValues = {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type InitialProfile = Pick<ProfileFormValues, 'fullName' | 'email'>;

type ValidationErrors = Partial<Record<keyof ProfileFormValues, string>>;

const DEFAULT_VALUES: ProfileFormValues = {
  fullName: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const DEFAULT_INITIAL_PROFILE: InitialProfile = {
  fullName: '',
  email: '',
};

function hashPassword(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash.toString();
}

function validate(
  values: ProfileFormValues,
  storedPasswordHash: string | null,
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!values.fullName.trim()) {
    errors.fullName = 'Nama lengkap wajib diisi.';
  }
  if (!values.email.trim()) {
    errors.email = 'Email wajib diisi.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Masukkan alamat email yang valid.';
  }

  const wantsPasswordChange = values.newPassword.trim().length > 0 || values.confirmPassword.trim().length > 0;
  if (wantsPasswordChange) {
    if (values.newPassword.length < 8) {
      errors.newPassword = 'Password baru minimal 8 karakter.';
    }
    if (values.newPassword !== values.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok.';
    }
    if (storedPasswordHash) {
      if (!values.currentPassword.trim()) {
        errors.currentPassword = 'Masukkan password saat ini.';
      } else if (hashPassword(values.currentPassword) !== storedPasswordHash) {
        errors.currentPassword = 'Password saat ini tidak sesuai.';
      }
    }
  } else if (values.currentPassword.trim()) {
    errors.newPassword = 'Masukkan password baru untuk mengganti kata sandi.';
  }

  return errors;
}

export default function AccountProfileSettingsPage(): ReactElement {
  const toast = useToast();
  const [initialProfile, setInitialProfile] = useState<InitialProfile>(DEFAULT_INITIAL_PROFILE);
  const [values, setValues] = useState<ProfileFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedPasswordHash, setStoredPasswordHash] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile) as InitialProfile;
        const merged = { ...DEFAULT_INITIAL_PROFILE, ...parsed };
        setInitialProfile(merged);
        setValues((previous) => ({
          ...previous,
          fullName: merged.fullName,
          email: merged.email,
        }));
      }
      const storedHash = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
      if (storedHash) {
        setStoredPasswordHash(storedHash);
      }
    } catch (error) {
      console.warn('Gagal membaca data profil akun dari penyimpanan lokal.', error);
    }
  }, []);

  const hasChanges = useMemo(() => {
    const profileChanged = values.fullName !== initialProfile.fullName || values.email !== initialProfile.email;
    const wantsPasswordChange =
      values.currentPassword.trim().length > 0 ||
      values.newPassword.trim().length > 0 ||
      values.confirmPassword.trim().length > 0;
    return profileChanged || wantsPasswordChange;
  }, [initialProfile.email, initialProfile.fullName, values.confirmPassword, values.currentPassword, values.email, values.fullName, values.newPassword]);

  const handleChange = useCallback(<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const validationErrors = validate(values, storedPasswordHash);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
      setIsSubmitting(true);
      try {
        if (typeof window !== 'undefined') {
          const profilePayload: InitialProfile = {
            fullName: values.fullName.trim(),
            email: values.email.trim(),
          };
          window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profilePayload));
          if (values.newPassword.trim().length > 0) {
            const hashed = hashPassword(values.newPassword.trim());
            window.localStorage.setItem(PASSWORD_STORAGE_KEY, hashed);
            setStoredPasswordHash(hashed);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 350));
        toast.success('Profil akun diperbarui. Gunakan data terbaru saat login berikutnya.');
        setInitialProfile({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
        });
        setValues((previous) => ({
          ...previous,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } catch (error) {
        console.error('Gagal menyimpan profil akun.', error);
        toast.error('Tidak dapat menyimpan perubahan. Coba ulang sebentar lagi.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [storedPasswordHash, toast, values],
  );

  return (
    <div className="flex flex-col gap-10">
      <SettingsBackLink />
      <header className="border-b-2 border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark">Pengaturan • Profil</p>
        <h1 className="mt-4 font-heading text-3xl text-neutral-dark">Data Personal</h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-mid">
          Informasi ini digunakan untuk komunikasi resmi dan proses login. Simpan perubahan untuk memperbarui catatan internal kami.
        </p>
      </header>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <section className="space-y-6 border-2 border-black bg-white px-6 py-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="fullName">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              name="fullName"
              value={values.fullName}
              onChange={(event) => handleChange('fullName', event.target.value)}
              placeholder="Contoh: Siti Rahma Ningsih"
              className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none focus:ring-0 rounded-none"
            />
            {errors.fullName && <p className="text-sm text-danger">{errors.fullName}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="email">
              Email Utama
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={values.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="Contoh: founder@bisniskopi.id"
              className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none focus:ring-0 rounded-none"
            />
            {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
          </div>
        </section>

        <section className="space-y-6 border-2 border-black bg-white px-6 py-8">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Keamanan Akun</p>
            <h2 className="font-heading text-2xl text-neutral-dark">Perbarui Password</h2>
            <p className="text-sm text-neutral-mid">
              Untuk alasan keamanan, password tidak pernah ditampilkan. Masukkan password saat ini kemudian setel password baru minimal 8 karakter.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="currentPassword">
                Password Saat Ini
              </label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={values.currentPassword}
                onChange={(event) => handleChange('currentPassword', event.target.value)}
                placeholder={storedPasswordHash ? 'Masukkan password lama Anda' : 'Belum pernah mengatur password'}
                className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none focus:ring-0 rounded-none"
                autoComplete="current-password"
              />
              {errors.currentPassword && <p className="text-sm text-danger">{errors.currentPassword}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="newPassword">
                Password Baru
              </label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={values.newPassword}
                onChange={(event) => handleChange('newPassword', event.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none focus:ring-0 rounded-none"
                autoComplete="new-password"
              />
              {errors.newPassword && <p className="text-sm text-danger">{errors.newPassword}</p>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="confirmPassword">
                Konfirmasi Password Baru
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={(event) => handleChange('confirmPassword', event.target.value)}
                placeholder="Ulangi password baru"
                className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none focus:ring-0 rounded-none"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-sm text-danger">{errors.confirmPassword}</p>}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-neutral-mid">
            Update profil akan berlaku secara instan di seluruh pengalaman Aksara Legal AI.
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="inline-flex items-center justify-center rounded-full border-2 border-black bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary-dark focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </footer>
      </form>
    </div>
  );
}
