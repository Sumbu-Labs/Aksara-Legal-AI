'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/motion';

export function HeroSection() {
  return (
    <motion.section
      className="min-h-screen bg-background px-4 py-16"
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={staggerContainer}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <motion.div className="flex flex-col gap-6" variants={fadeInUp}>
          <h1 className="font-heading text-4xl font-bold leading-tight text-neutral-dark md:text-5xl lg:text-6xl">
            Singkirkan kerumitan perizinan dengan co-pilot legal berbasis AI
          </h1>
          <motion.p className="text-lg text-neutral-mid md:text-xl" variants={fadeInUp}>
            Aksara Legal AI membantu UMKM dan startup memetakan kewajiban regulasi, menyusun checklist, dan menghasilkan draf
            dokumen dalam hitungan menit.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              href="/auth?mode=register"
              className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-medium text-white shadow-card transition-colors hover:bg-primary-dark"
            >
              Mulai Sekarang
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="aspect-square border-2 border-neutral-light bg-white shadow-card"
          aria-hidden="true"
          variants={fadeInUp}
        />
      </div>
    </motion.section>
  );
}
