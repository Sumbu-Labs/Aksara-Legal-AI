import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getPermitBySlug, permitSlugs } from '@/data/permits';
import ChatPanel from './ChatPanel';

type PageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams(): PageProps['params'][] {
  return permitSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const permit = getPermitBySlug(params.slug);
  if (!permit) {
    return {
      title: 'Asisten AI',
      description: 'Asisten AI Aksara untuk membantu perizinan UMKM.',
    } satisfies Metadata;
  }

  const pageTitle = `Asisten AI: ${permit.name}`;
  return {
    title: pageTitle,
    description: permit.summary,
    openGraph: {
      title: pageTitle,
      description: permit.summary,
    },
    twitter: {
      title: pageTitle,
      description: permit.summary,
      card: 'summary_large_image',
    },
  } satisfies Metadata;
}

export default function PermitAssistantPage({ params }: PageProps) {
  const permit = getPermitBySlug(params.slug);
  if (!permit) {
    notFound();
  }

  return (
    <div className='bg-secondary/20 pb-16 pt-12'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex-1'>
            <p className='text-xs font-semibold uppercase tracking-[0.35em] text-neutral-mid'>
              Aksara AI Assistant
            </p>
            <h1 className='mt-3 font-heading text-4xl uppercase tracking-[0.08em] text-neutral-dark md:text-5xl'>
              Asisten AI: {permit.name}
            </h1>
            <p className='mt-4 max-w-3xl text-base leading-relaxed text-neutral-mid md:text-lg'>
              {permit.summary}
            </p>
          </div>
          <div className='flex items-center gap-3 self-start'>
            <span className='rounded-full border-2 border-neutral-dark bg-white px-4 py-1 text-sm font-semibold uppercase tracking-wide text-neutral-dark'>
              {permit.shortName}
            </span>
            <Link
              href='/dashboard'
              className='border-2 border-black bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-dark transition-colors hover:bg-secondary'
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        <div className='grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
          <ChatPanel permit={permit} />

          <aside className='flex flex-col gap-6 rounded-xl border-2 border-neutral-light bg-white p-6 shadow-[var(--box-shadow-card)]'>
            <div>
              <h2 className='font-heading text-2xl text-neutral-dark'>Fokus Utama</h2>
              <p className='mt-2 text-sm leading-relaxed text-neutral-mid'>
                {permit.heroTagline}
              </p>
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-semibold uppercase tracking-[0.3em] text-neutral-mid'>
                Checklist Penting
              </h3>
              <ul className='space-y-3 text-sm text-neutral-dark'>
                {permit.highlights.map((point) => (
                  <li key={point} className='flex items-start gap-3'>
                    <span className='mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary' />
                    <span className='leading-relaxed text-neutral-mid'>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='rounded-lg border-2 border-neutral-light bg-secondary/20 p-4 text-xs text-neutral-mid'>
              <p className='font-semibold text-neutral-dark'>Tips Demo</p>
              <p className='mt-2'>
                Gunakan contoh pertanyaan atau konteks usaha Anda untuk melihat bagaimana AI menyesuaikan jawaban dan sumber regulasi.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
