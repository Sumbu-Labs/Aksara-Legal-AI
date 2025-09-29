const testimonials = [
  {
    name: 'Sari Dewi',
    role: 'Founder, Kopi Harapan',
    quote:
      'Aksara Legal AI menyelamatkan kami dari kebingungan. Checklist yang jelas membuat tim kecil kami bisa mengurus PIRT dan Halal tanpa lembur.',
  },
  {
    name: 'Rifqi Prasetyo',
    role: 'COO, Cendana Foods',
    quote:
      'Autopilot dokumennya luar biasa. Dalam satu malam kami sudah punya draf lengkap untuk pengajuan BPOM dan tinggal review akhir. Sebelumnya proses ini bisa memakan waktu berminggu-minggu karena harus bolak-balik revisi dengan tim legal eksternal.',
  },
  {
    name: 'Mei Ling',
    role: 'Owner, Atelier Botanica',
    quote:
      'AI Q&A-nya seperti punya konsultan pribadi. Jawaban cepat dan ada referensi regulasi yang jelas setiap kali kami bertanya.',
  },
  {
    name: 'Handoko Wicaksono',
    role: 'Director, Nusantara Health Lab',
    quote:
      'Kami pakai paket Pro untuk beberapa cabang. Monitoring status kepatuhan real-time membuat audit internal jadi jauh lebih ringan, terutama ketika harus menyiapkan data untuk inspeksi mendadak dari dinas kesehatan.',
  },
  {
    name: 'Putri Azizah',
    role: 'Head of Operations, Sinar Rempah',
    quote:
      'Tim bisa fokus ke produksi karena Aksara sudah mengatur timeline dan pengingat dokumen kadaluarsa. Efisiensi kerja meningkat drastis.',
  },
  {
    name: 'Galih Mahendra',
    role: 'Co-founder, BioStart Labs',
    quote:
      'Integrasi dengan storage internal membuat berbagi dokumen antar divisi super cepat. Tidak perlu lagi kirim-kirim file manual, dan setiap revisi otomatis terdokumentasi sehingga audit trail terjaga.',
  },
  {
    name: 'Larasati Widya',
    role: 'Compliance Lead, Rumah Sehat Kita',
    quote:
      'Kami butuh solusi cepat saat ekspansi. Aksara memberi panduan yang bisa langsung dieksekusi oleh tim lapangan tanpa banyak training.',
  },
  {
    name: 'Dimas Rahadian',
    role: 'Founder, Lumina Studio',
    quote:
      'Transparansi harga dan upgrade pay-as-you-go sangat cocok untuk project-based. Kami hanya membayar fitur tambahan ketika dibutuhkan, jadi cashflow perusahaan tetap sehat.',
  },
  {
    name: 'Irena Kusuma',
    role: 'CEO, Patisserie Amara',
    quote:
      'Setiap kali ada perubahan regulasi, dashboard Aksara langsung memberi alert lengkap dengan langkah yang harus dilakukan. Sangat membantu.',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-secondary/30 py-20 px-4 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-neutral-dark">
            Apa kata pengguna Aksara Legal AI
          </h2>
        </div>

        <div className="mt-16 columns-1 gap-6 md:columns-2 lg:columns-3 [column-fill:_balance]">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="mb-6 break-inside-avoid border-2 border-neutral-light bg-secondary p-6 shadow-card"
            >
              <p className="text-neutral-dark text-base leading-relaxed">
                “{testimonial.quote}”
              </p>
              <div className="mt-6">
                <p className="font-heading text-lg font-semibold text-neutral-dark">
                  {testimonial.name}
                </p>
                <p className="text-sm text-neutral-mid">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
