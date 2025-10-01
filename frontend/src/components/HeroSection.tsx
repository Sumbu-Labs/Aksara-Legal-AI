'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/motion';

export function HeroSection() {
  return (
    <motion.section
      className="min-h-screen bg-background py-16 pl-6 pr-0 md:py-24 md:pl-16"
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={staggerContainer}
    >
      <div className="grid w-full gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
        <motion.div className="flex max-w-xl flex-col gap-6" variants={fadeInUp}>
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
          className="relative h-[320px] overflow-hidden border-2 border-neutral-light bg-white shadow-card md:h-full md:min-h-[560px]"
          aria-hidden="true"
          variants={fadeInUp}
        >
          <Image
            src="/images/product.jpg"
            alt="Antarmuka Aksara Legal AI"
            fill
            priority
            className="object-cover object-left"
            sizes="(min-width: 768px) 55vw, 100vw"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
