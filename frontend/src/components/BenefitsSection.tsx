const benefits = [
  {
    title: 'Checklist otomatis yang selalu update',
    description:
      'Regulasi terbaru langsung terhubung ke akun Anda. Cukup isi profil usaha, kami susun kewajiban yang relevan secara otomatis.',
    layoutClass: 'md:col-span-3 lg:col-span-4 lg:row-start-1',
  },
  {
    title: 'Workflow perizinan tanpa bottleneck',
    description:
      'Tugas setiap anggota tim terdistribusi rapi dengan tenggat jelas dan progress yang mudah dipantau dalam satu dasbor.',
    layoutClass: 'md:col-span-3 lg:col-span-4 lg:row-start-1',
  },
  {
    title: 'AI co-pilot untuk drafting dokumen',
    description:
      'Mulai dari surat pernyataan hingga form legal, generator kami memberi draf siap edit lengkap dengan referensi regulasi.',
    layoutClass: 'md:col-span-3 lg:col-span-4 lg:row-start-1',
  },
  {
    title: 'Analitik kepatuhan real-time',
    description:
      'Pantau status kepatuhan lintas cabang. Sistem memberi alert dini ketika dokumen kadaluarsa atau kewajiban baru muncul.',
    layoutClass: 'md:col-span-3 lg:col-span-6 lg:row-start-2',
  },
  {
    title: 'Integrasi siap pakai',
    description:
      'Hubungkan Aksara Legal AI ke sistem HR, accounting, atau cloud storage untuk alur kerja yang benar-benar terotomatisasi.',
    layoutClass: 'md:col-span-3 lg:col-span-6 lg:row-start-2',
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-background py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark">
            Keunggulan Aksara
          </h2>
        </div>

        <div className="mt-12 grid auto-rows-[minmax(180px,auto)] gap-6 md:grid-cols-6 lg:grid-cols-12 lg:[grid-template-rows:minmax(0,1fr)_minmax(140px,1fr)]">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className={`group relative overflow-hidden border-2 border-neutral-light bg-secondary/60 p-8 shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${benefit.layoutClass}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col gap-4">
                <h3 className="font-heading text-2xl font-semibold text-neutral-dark">
                  {benefit.title}
                </h3>
                <p className="text-neutral-mid text-base leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
