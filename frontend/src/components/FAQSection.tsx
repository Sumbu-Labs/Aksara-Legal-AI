'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/motion';

const faqs = [
  {
    question: 'Apa yang termasuk dalam paket Gratis?',
    answer:
      'Paket Gratis memberi Anda akses ke checklist perizinan dasar, 10 pertanyaan AI per bulan, dan 3 unggahan dokumen untuk memulai pengelolaan kepatuhan tanpa biaya.',
  },
  {
    question: 'Bagaimana cara kerja paket Satuan?',
    answer:
      'Paket Satuan cocok untuk kebutuhan izin spesifik. Setelah memilih izin, Anda mendapatkan Q&A tanpa batas, unggahan dokumen tanpa batas, dan 1x Aksara Autopilot untuk izin tersebut.',
  },
  {
    question: 'Apakah paket Pro bisa digunakan oleh beberapa anggota tim?',
    answer:
      'Ya. Paket Pro mendukung kolaborasi lintas divisi dengan Q&A tanpa batas, unggahan dokumen tanpa batas, Autopilot tanpa batas, serta dukungan prioritas untuk tim Anda.',
  },
  {
    question: 'Bisakah saya memindahkan data jika upgrade paket?',
    answer:
      'Seluruh profil bisnis, checklist, dan dokumen tersimpan secara aman. Saat Anda upgrade paket, data tetap tersedia dan fitur tambahan langsung aktif tanpa migrasi manual.',
  },
  {
    question: 'Apakah Aksara Legal AI terhubung dengan konsultan hukum?',
    answer:
      'Untuk MVP ini kami fokus pada otomasi berbasis AI dan workflow internal. Kami sedang menyiapkan jaringan mitra konsultan yang dapat dihubungkan melalui paket khusus di roadmap berikutnya.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.section
      id="faq"
      className="bg-background px-4 py-20 scroll-mt-16"
      initial="hidden"
      whileInView="visible"
      variants={staggerContainer}
      viewport={viewportConfig}
    >
      <div className="mx-auto max-w-4xl">
        <motion.div className="text-center" variants={fadeInUp}>
          <h2 className="mt-4 font-heading text-3xl font-bold text-neutral-dark md:text-4xl">
            Pertanyaan yang sering ditanyakan
          </h2>
        </motion.div>

        <div className="mt-12 border border-neutral-light bg-secondary/40 shadow-card">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.question}
                className={index < faqs.length - 1 ? 'border-b border-neutral-light' : ''}
                variants={fadeInUp}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-heading text-xl font-semibold text-neutral-dark">
                    {faq.question}
                  </span>
                  <span className="text-2xl font-semibold text-primary" aria-hidden="true">
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
                {isOpen ? (
                  <div className="px-6 pb-6 text-base leading-relaxed text-neutral-mid">
                    {faq.answer}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
