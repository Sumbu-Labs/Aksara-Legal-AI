'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { fadeInUp, viewportConfig } from '@/lib/motion';

export function CTASection() {
  return (
    <motion.section
      id="get-started"
      className="bg-primary px-4 py-16 text-center scroll-mt-16"
      initial="hidden"
      whileInView="visible"
      variants={fadeInUp}
      viewport={viewportConfig}
    >
      <div className="mx-auto max-w-4xl">
        <motion.h2 className="mb-6 font-heading text-3xl font-bold text-white md:text-4xl" variants={fadeInUp}>
          Siap Menghemat Waktu Administrasi Anda?
        </motion.h2>
        <motion.p className="mb-8 text-lg text-white opacity-90 md:text-xl" variants={fadeInUp}>
          Bergabunglah dengan ribuan UMKM yang telah menggunakan Aksara Legal AI untuk menyelesaikan perizinan dengan cepat dan mudah.
        </motion.p>
        <motion.div className="flex flex-col justify-center gap-4 sm:flex-row" variants={fadeInUp}>
          <Link
            href="/auth?mode=register"
            className="rounded-full bg-white px-8 py-4 text-lg font-medium text-primary transition-colors hover:bg-gray-100 shadow-card"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/auth?mode=login"
            className="rounded-full border-2 border-white px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-white hover:text-primary"
          >
            Masuk
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
