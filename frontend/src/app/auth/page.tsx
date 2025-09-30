'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { Suspense, useCallback, useEffect, useState } from 'react';

import {
  login as loginRequest,
  persistTokens,
  register as registerRequest,
} from '@/services/auth';
import type { LoginPayload, RegisterPayload } from '@/services/auth';
import { useToast } from '@/components/ToastProvider';

type AuthMode = 'register' | 'login';

export default function AuthPage(): ReactElement {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent(): ReactElement {
  const [mode, setMode] = useState<AuthMode>('register');
  const isLogin = mode === 'login';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'login' || requestedMode === 'register') {
      setMode(requestedMode);
    }
  }, [searchParams]);

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      setIsSubmitting(true);
      try {
        const tokens = await registerRequest(payload);
        persistTokens(tokens);
        toast.success('Pendaftaran berhasil! Selamat datang di Aksara Legal AI.');
        router.push('/onboarding');
      } catch (error) {
        const message = error instanceof Error ? error.message : null;
        toast.error(localizeErrorMessage(message, 'register'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, toast],
  );

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      setIsSubmitting(true);
      try {
        const tokens = await loginRequest(payload);
        persistTokens(tokens);
        toast.success('Berhasil masuk. Senang bertemu lagi!');
        router.push('/onboarding');
      } catch (error) {
        const message = error instanceof Error ? error.message : null;
        toast.error(localizeErrorMessage(message, 'login'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, toast],
  );

  const switchToRegister = useCallback(() => {
    setMode('register');
  }, []);

  const switchToLogin = useCallback(() => {
    setMode('login');
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white lg:flex-row">
        <section
          className={`${
            isLogin ? 'hidden lg:flex lg:pointer-events-none' : 'flex lg:pointer-events-auto'
          } ${SECTION_BASE}`}
          aria-hidden={isLogin ? 'true' : 'false'}
        >
          <RegisterForm
            onSwitchMode={switchToLogin}
            onSubmit={handleRegister}
            isSubmitting={isSubmitting}
          />
        </section>

        <section
          className={`${
            isLogin ? 'flex lg:pointer-events-auto' : 'hidden lg:flex lg:pointer-events-none'
          } ${SECTION_BASE}`}
          aria-hidden={!isLogin ? 'true' : 'false'}
        >
          <LoginForm
            onSwitchMode={switchToRegister}
            onSubmit={handleLogin}
            isSubmitting={isSubmitting}
          />
        </section>

        <aside
          className={`absolute inset-y-0 left-0 hidden w-full transform transition-transform duration-500 ease-in-out lg:block lg:w-1/2 lg:z-20 ${
            isLogin ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-hidden="true"
        >
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src="/images/login2.png"
              alt="Ilustrasi profesional yang menggunakan Aksara Legal AI"
              fill
              className="object-cover"
              priority
            />            
          </div>
        </aside>
      </div>
    </div>
  );
}

function AuthPageFallback(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-neutral-mid" role="status" aria-live="polite">
        Memuat halaman autentikasi...
      </p>
    </div>
  );
}

const SECTION_BASE = 'relative flex-1 flex-col justify-center gap-10 px-8 py-12 sm:px-12 lg:px-16';

function localizeErrorMessage(rawMessage: string | null | undefined, context: AuthMode): string {
  const fallback = context === 'register'
    ? 'Pendaftaran gagal. Silakan coba lagi.'
    : 'Gagal masuk. Silakan coba lagi.';

  if (!rawMessage) {
    return fallback;
  }

  const message = rawMessage.trim();
  if (message.length === 0) {
    return fallback;
  }

  const normalized = message.toLowerCase();
  const indonesianHints = ['gagal', 'tidak', 'silakan', 'akun', 'masuk', 'sandi', 'berhasil', 'sudah'];
  if (indonesianHints.some((hint) => normalized.includes(hint))) {
    return message;
  }

  if (normalized.includes('already') && normalized.includes('register')) {
    return 'Email sudah terdaftar.';
  }
  if (normalized.includes('invalid credentials') || normalized.includes('wrong credentials')) {
    return 'Email atau kata sandi tidak valid.';
  }
  if (normalized.includes('not found')) {
    return 'Akun tidak ditemukan.';
  }
  if (normalized.includes('password')) {
    return 'Kata sandi tidak valid.';
  }

  return fallback;
}

type RegisterFormProps = {
  onSwitchMode: () => void;
  onSubmit: (payload: RegisterPayload) => Promise<void> | void;
  isSubmitting: boolean;
};

function RegisterForm({ onSwitchMode, onSubmit, isSubmitting }: RegisterFormProps): ReactElement {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: RegisterPayload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Mulai Gratis</p>
        <h1 className="font-heading text-3xl font-bold text-neutral-dark sm:text-4xl">
          Buat akun Aksara Legal AI
        </h1>
        <p className="text-neutral-mid">
          Automatisasi dokumen kepatuhan dan pantau progres izin usaha dalam satu dashboard.
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark" htmlFor="register-name">
            Nama Lengkap
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            required
            placeholder="Contoh:  Fulan Bin Fulan"
            className="w-full border-2 border-neutral-light bg-secondary/20 px-4 py-3 text-sm text-neutral-dark transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            placeholder="nama@perusahaan.com"
            className="w-full border-2 border-neutral-light bg-secondary/20 px-4 py-3 text-sm text-neutral-dark transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark" htmlFor="register-password">
            Kata Sandi
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
            className="w-full border-2 border-neutral-light bg-secondary/20 px-4 py-3 text-sm text-neutral-dark transition-colors focus:border-primary focus:outline-none"
          />
          <p className="text-xs text-neutral-mid">Gunakan kombinasi huruf, angka, dan simbol.</p>
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer border-2 border-black bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <p className="text-sm text-neutral-mid">
        Sudah punya akun?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="cursor-pointer font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-dark hover:underline"
        >
          Masuk di sini
        </button>
      </p>
    </div>
  );
}

type LoginFormProps = {
  onSwitchMode: () => void;
  onSubmit: (payload: LoginPayload) => Promise<void> | void;
  isSubmitting: boolean;
};

function LoginForm({ onSwitchMode, onSubmit, isSubmitting }: LoginFormProps): ReactElement {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: LoginPayload = {
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Selamat Datang</p>
        <h1 className="font-heading text-3xl font-bold text-neutral-dark sm:text-4xl">Masuk ke akun Anda</h1>
        <p className="text-neutral-mid">
          Lanjutkan pengelolaan dokumen dan monitoring izin usaha dengan cepat.
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            placeholder="nama@perusahaan.com"
            className="w-full border-2 border-neutral-light bg-secondary/20 px-4 py-3 text-sm text-neutral-dark transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark" htmlFor="login-password">
            Kata Sandi
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            placeholder="Masukkan kata sandi"
            className="w-full border-2 border-neutral-light bg-secondary/20 px-4 py-3 text-sm text-neutral-dark transition-colors focus:border-primary focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer border-2 border-black bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="text-sm text-neutral-mid">
        Belum punya akun?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="cursor-pointer font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-dark hover:underline"
        >
          Daftar sekarang
        </button>
      </p>
    </div>
  );
}
