'use client';

import { motion } from 'framer-motion';

import { fadeInUp, viewportConfig } from '@/lib/motion';

export function ProblemSection() {
  return (
    <motion.section
      className="bg-primary px-4 py-16"
      initial="hidden"
      whileInView="visible"
      variants={fadeInUp}
      viewport={viewportConfig}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="font-heading text-4xl uppercase leading-tight text-[var(--background)] md:text-5xl lg:text-6xl"
          variants={fadeInUp}
        >
          <span className="opacity-100">AKSARA Legal AI</span> mengubah<br />
          birokrasi kompleks 📋✨<br />
          Kami <span className="opacity-90">memberdayakan</span> UMKM<br />
          dengan kepatuhan cerdas 🤖<br /> di mana regulasi menjadi <span className="opacity-90">sederhana</span>💡<br />
          dan mimpi bisnis
          <span className="opacity-100"> melambung</span> 🚀
        </motion.div>
      </div>
    </motion.section>
  );
}
