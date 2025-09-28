export function ProblemSection() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-12">
          Masalah Birokrasi yang Menghambat Pertumbuhan
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-secondary p-6 border-black border-2 shadow-card">
            <h3 className="font-heading text-xl font-semibold text-neutral-dark mb-4">Kompleksitas Regulasi</h3>
            <p className="text-neutral-mid">
              Proses perizinan penuh dengan jargon hukum dan alur yang tidak jelas, membuat founder bingung.
            </p>
          </div>
          <div className="bg-secondary p-6 border-black border-2 shadow-card">
            <h3 className="font-heading text-xl font-semibold text-neutral-dark mb-4">Beban Administratif</h3>
            <p className="text-neutral-mid">
              Founder menghabiskan puluhan jam mengisi formulir, waktu yang seharusnya untuk produk dan pelanggan.
            </p>
          </div>
          <div className="bg-secondary p-6 border-black border-2 shadow-card">
            <h3 className="font-heading text-xl font-semibold text-neutral-dark mb-4">Keterbatasan Anggaran</h3>
            <p className="text-neutral-mid">
              Belum ada anggaran untuk konsultan hukum mahal, semua urusan administratif ditangani sendiri.
            </p>
          </div>
        </div>
        <div className="bg-secondary p-8 border-black border-2 shadow-card max-w-2xl mx-auto">
          <h3 className="font-heading text-2xl font-semibold text-neutral-dark mb-4">Cerita Sari Dewi</h3>
          <p className="text-neutral-mid mb-4">
            Sari, founder "Kopi Harapan" di Sleman, merasa tersesat saat mengurus PIRT dan Halal. "Saya lelah mengisi formulir yang mirip satu sama lain," katanya.
          </p>
          <p className="text-neutral-mid">
            Sari fokus pada produk dan pemasaran, tapi birokrasi menghabiskan 50% waktunya.
          </p>
        </div>
      </div>
    </section>
  );
}