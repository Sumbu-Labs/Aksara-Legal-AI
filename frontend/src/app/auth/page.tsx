'use client';

import type { FormEvent, JSX } from 'react';
import { useState } from 'react';

type AuthMode = 'register' | 'login';

export default function AuthPage(): JSX.Element {
  const [mode, setMode] = useState<AuthMode>('register');
  const isLogin = mode === 'login';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex min-h-screen w-full flex-col overflow-hidden bg-white lg:flex-row">
        <div
          className={`flex w-full flex-col justify-center gap-10 px-8 py-12 transition-transform duration-500 ease-in-out sm:px-12 lg:w-1/2 lg:px-16 ${
            isLogin ? 'lg:translate-x-full' : 'lg:translate-x-0'
          }`}
        >
          {isLogin ? (
            <LoginForm onSwitchMode={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchMode={() => setMode('login')} />
          )}
        </div>

        <aside
          className={`flex h-72 w-full items-center justify-center bg-secondary/30 text-neutral-mid transition-transform duration-500 ease-in-out lg:h-auto lg:w-1/2 lg:bg-secondary/40 ${
            isLogin ? 'lg:-translate-x-full' : 'lg:translate-x-0'
          }`}
          aria-hidden="true"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.3em]">Area Visual</span>
        </aside>
      </div>
    </div>
  );
}

function RegisterForm({ onSwitchMode }: { onSwitchMode: () => void }): JSX.Element {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Integrate with register API.
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
            placeholder="Contoh: Dzikran Maulana"
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
          className="w-full border-2 border-black bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark"
        >
          Daftar
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

function LoginForm({ onSwitchMode }: { onSwitchMode: () => void }): JSX.Element {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Integrate with login API.
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
          className="w-full border-2 border-black bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark"
        >
          Masuk
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
