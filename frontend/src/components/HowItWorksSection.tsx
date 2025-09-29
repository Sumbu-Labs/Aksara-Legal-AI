const steps = [
  {
    title: 'Buat akun & pilih tujuan',
    description:
      'Daftarkan tim Anda, pilih jenis usaha, dan tentukan target kepatuhan yang ingin dicapai.',
  },
  {
    title: 'Lengkapi profil bisnis',
    description:
      'Jawab beberapa pertanyaan kunci seputar legalitas, lokasi, dan struktur usaha untuk memetakan kewajiban.',
  },
  {
    title: 'Aktifkan co-pilot',
    description:
      'Terima checklist prioritas, atur workflow, dan gunakan AI untuk menjawab pertanyaan serta menyiapkan dokumen.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-secondary/40 py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-neutral-dark">
            Mulai dalam tiga langkah mudah
          </h2>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-6 border border-neutral-light bg-white/90 p-8 text-left shadow-card transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="font-heading text-xl font-semibold text-neutral-dark">
                  {step.title}
                </h3>
              </div>
              <p className="text-base leading-relaxed text-neutral-mid">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
