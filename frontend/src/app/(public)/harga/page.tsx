'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { motion } from 'framer-motion';

import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/motion';

const PRICING_PLANS = [
  {
    id: 'gratis',
    name: 'Gratis',
    priceLabel: 'Rp0',
    period: '',
    description: 'Uji coba Aksara dengan risiko nol dan lihat checklist prioritas yang kami rekomendasikan.',
    idealFor: 'Founder yang ingin mencoba Aksara sebelum berkomitmen.',
    features: [
      '10 pertanyaan AI per bulan',
      '3 unggahan dokumen',
      'Checklist perizinan dasar',
    ],
    ctaLabel: 'Pilih Paket Gratis',
    ctaHref: '/auth/register?plan=gratis',
    highlighted: false,
  },
  {
    id: 'satuan',
    name: 'Satuan',
    priceLabel: 'Rp75.000',
    period: 'per izin',
    description: 'Bayar hanya untuk izin yang sedang Anda kejar dan dapatkan dukungan penuh untuk prosesnya.',
    idealFor: 'UMKM yang fokus menyelesaikan satu izin spesifik.',
    features: [
      'Q&A tanpa batas untuk izin yang dibeli',
      'Unggahan dokumen tanpa batas untuk izin tersebut',
      '1x Autopilot generate dokumen',
    ],
    ctaLabel: 'Pilih Paket Satuan',
    ctaHref: '/auth/register?plan=satuan',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: 'Rp49.000',
    period: 'per bulan (tagihan tahunan)',
    description: 'Automasi penuh untuk tim kepatuhan Anda dengan dukungan prioritas dan Autopilot tanpa batas.',
    idealFor: 'Bisnis yang butuh skalabilitas dan dokumentasi berulang.',
    features: [
      'Q&A AI tanpa batas',
      'Unggahan dokumen tanpa batas',
      'Autopilot generate dokumen tanpa batas',
      'Prioritas dukungan dan roadmap fitur',
    ],
    ctaLabel: 'Langganan Paket Pro',
    ctaHref: '/auth/register?plan=pro',
    highlighted: true,
  },
] as const;

const COMPARISON_FEATURES = [
  {
    label: 'Pertanyaan AI',
    gratis: '10 / bulan',
    satuan: 'Tak terbatas (izin dibeli)',
    pro: 'Tak terbatas',
  },
  {
    label: 'Unggahan Dokumen',
    gratis: '3 file',
    satuan: 'Tak terbatas (izin dibeli)',
    pro: 'Tak terbatas',
  },
  {
    label: 'Checklist Perizinan',
    gratis: 'Checklist dasar',
    satuan: 'Checklist lengkap untuk izin dibeli',
    pro: 'Checklist lintas izin + delegasi tim',
  },
  {
    label: 'Autopilot Dokumen',
    gratis: 'Tidak tersedia',
    satuan: '1x per izin',
    pro: 'Tak terbatas',
  },
  {
    label: 'Kolaborasi Tim',
    gratis: 'Tidak tersedia',
    satuan: 'Tidak tersedia',
    pro: 'Termasuk',
  },
  {
    label: 'Dukungan & Onboarding',
    gratis: 'Email 48 jam',
    satuan: 'Chat standar',
    pro: 'Prioritas + sesi onboarding',
  },
] as const;

const VALUE_POINTS = [
  {
    title: 'Transparan tanpa biaya tersembunyi',
    description:
      'Semua paket kami sudah termasuk akses ke basis pengetahuan regulasi. Anda hanya membayar fitur tambahan yang benar-benar dipakai.',
  },
  {
    title: 'ROI jelas sejak bulan pertama',
    description:
      'Bandingkan dengan biaya konsultan: satu izin dapat memakan biaya jutaan rupiah. Dengan Pro, tim Anda bisa mengurus beberapa izin sekaligus.',
  },
  {
    title: 'Skalabel mengikuti perkembangan bisnis',
    description:
      'Mulai dari Gratis lalu naik ke Satuan atau Pro saat volume dokumen bertambah. Perpindahan paket dilakukan sekali klik.',
  },
] as const;

export default function PricingPage(): ReactElement {
  return (
    <main className="bg-background text-neutral-dark">
      <motion.section
        className="border-b-2 border-black bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={viewportConfig}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <motion.div className="max-w-3xl space-y-4" variants={fadeInUp}>
            <h1 className="font-heading text-4xl leading-tight md:text-5xl">
              Paket fleksibel untuk setiap fase pertumbuhan bisnis Anda
            </h1>
            <motion.p className="text-base text-neutral-mid md:text-lg" variants={fadeInUp}>
              Pilih paket Gratis untuk eksplorasi, Satuan untuk fokus pada satu izin, atau Pro untuk automasi kepatuhan skala penuh.
              Setiap paket didesain agar Anda tahu persis apa yang didapat tanpa biaya tersembunyi.
            </motion.p>
          </motion.div>
          <motion.div
            className="space-y-4 rounded-2xl border-2 border-black bg-white px-6 py-6 text-sm text-neutral-mid lg:max-w-sm"
            variants={fadeInUp}
          >
            <h2 className="font-heading text-2xl text-neutral-dark">Butuh rekomendasi paket?</h2>
            <p>
              Jawab beberapa pertanyaan di onboarding dashboard, dan Aksara akan merekomendasikan paket serta izin prioritas yang paling relevan.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-black bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark"
            >
              Mulai Onboarding
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-6 py-16 lg:px-10"
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={viewportConfig}
      >
        <motion.header className="max-w-3xl space-y-3" variants={fadeInUp}>
          <h2 className="font-heading text-3xl md:text-4xl">Bandingkan paket secara ringkas</h2>
          <motion.p className="text-base text-neutral-mid" variants={fadeInUp}>
            Setiap paket dirancang untuk konteks operasional yang berbeda. Gunakan tabel berikut untuk melihat perbedaan nilai yang Anda dapatkan.
          </motion.p>
        </motion.header>

        <motion.div className="mt-10 overflow-hidden border-2 border-black bg-white" variants={fadeInUp}>
          <table className="w-full min-w-[640px] table-fixed text-left text-sm text-neutral-dark">
            <thead className="bg-secondary/40 text-xs uppercase tracking-[0.2em] text-neutral-mid">
              <tr>
                <th className="px-6 py-4 font-semibold">Fitur</th>
                <th className="px-6 py-4 font-semibold">Gratis</th>
                <th className="px-6 py-4 font-semibold">Satuan</th>
                <th className="px-6 py-4 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((feature) => (
                <motion.tr key={feature.label} className="border-t border-black/10" variants={fadeInUp}>
                  <th scope="row" className="px-6 py-5 text-sm font-semibold text-neutral-dark">
                    {feature.label}
                  </th>
                  <td className="px-6 py-5 text-sm text-neutral-mid">{feature.gratis}</td>
                  <td className="px-6 py-5 text-sm text-neutral-mid">{feature.satuan}</td>
                  <td className="px-6 py-5 text-sm text-neutral-mid">{feature.pro}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.section>

      <motion.section
        className="border-y-2 border-black bg-white/90"
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={viewportConfig}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <motion.header className="max-w-3xl" variants={fadeInUp}>
            <h2 className="font-heading text-3xl md:text-4xl">Rasionalisasi harga & nilai</h2>
            <motion.p className="mt-3 text-base text-neutral-mid" variants={fadeInUp}>
              Kami membangun paket berdasarkan data biaya yang sering dikeluarkan founder saat mengurus izin sendiri atau lewat konsultan. Berikut perbandingan investasi vs. nilai yang kami berikan.
            </motion.p>
          </motion.header>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {VALUE_POINTS.map((point) => (
              <motion.div
                key={point.title}
                className="flex flex-col gap-4 border-2 border-black bg-background px-6 py-6"
                variants={fadeInUp}
              >
                <h3 className="font-heading text-2xl text-neutral-dark">{point.title}</h3>
                <p className="text-sm text-neutral-mid">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-6 py-16 lg:px-10"
        initial="hidden"
        whileInView="visible"
        variants={staggerContainer}
        viewport={viewportConfig}
      >
        <motion.header className="mx-auto max-w-2xl space-y-3 text-center" variants={fadeInUp}>
          <h2 className="font-heading text-3xl md:text-4xl">Pilih paket dan mulai hari ini</h2>
          <motion.p className="text-base text-neutral-mid" variants={fadeInUp}>
            Semua paket dapat ditingkatkan atau diturunkan kapan saja dari dashboard. Tidak ada biaya setup ataupun penalti.
          </motion.p>
        </motion.header>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              className={`flex h-full flex-col gap-5 border-2 border-black bg-white px-6 py-8 transition-transform hover:-translate-y-2 ${
                plan.highlighted ? 'ring-4 ring-primary/60 ring-offset-2 ring-offset-background' : ''
              }`}
              variants={fadeInUp}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-2xl text-neutral-dark">{plan.name}</h3>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-primary">{plan.idealFor}</p>
                </div>
                {plan.highlighted ? (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Terpopuler
                  </span>
                ) : null}
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-neutral-dark">{plan.priceLabel}</span>
                  {plan.period ? (
                    <span className="text-sm font-medium text-neutral-mid">{plan.period}</span>
                  ) : null}
                </div>
                <p className="text-sm text-neutral-mid">{plan.description}</p>
              </div>

              <ul className="flex flex-1 list-disc flex-col gap-3 pl-5 text-sm text-neutral-mid">
                {plan.features.map((feature) => (
                  <li key={feature} className="marker:text-primary">
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`inline-flex w-full items-center justify-center gap-2 border-2 border-black px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-colors ${
                  plan.highlighted
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-background text-neutral-dark hover:bg-secondary'
                }`}
              >
                {plan.ctaLabel}
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
