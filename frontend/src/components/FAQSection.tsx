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
  return (
    <section className="bg-background py-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            FAQ
          </p>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-neutral-dark">
            Pertanyaan yang sering ditanyakan
          </h2>
        </div>

        <div className="mt-12 space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-3xl border border-neutral-light bg-secondary/40 p-6 shadow-card"
            >
              <h3 className="font-heading text-xl font-semibold text-neutral-dark">
                {faq.question}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-neutral-mid">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
