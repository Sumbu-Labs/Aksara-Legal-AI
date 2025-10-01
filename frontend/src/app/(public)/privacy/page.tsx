export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-10 text-neutral-dark">
        <header className="space-y-4 border-b-2 border-black pb-6">
          <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">Kebijakan Privasi</h1>
          <p className="text-lg text-neutral-mid">
            Kebijakan ini menjelaskan bagaimana Aksara Legal AI mengumpulkan, menggunakan, dan melindungi informasi Anda saat
            menggunakan layanan kami.
          </p>
        </header>

        <section className="space-y-4 border-b-2 border-black pb-6">
          <h2 className="font-heading text-2xl font-semibold">Informasi yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar, melengkapi profil bisnis, mengunggah
            dokumen, atau berinteraksi dengan fitur AI kami. Data ini dapat mencakup nama, alamat email, informasi bisnis, dan
            dokumen perizinan.
          </p>
        </section>

        <section className="space-y-4 border-b-2 border-black pb-6">
          <h2 className="font-heading text-2xl font-semibold">Cara Kami Menggunakan Data</h2>
          <p>
            Data Anda digunakan untuk memberikan layanan perizinan, menyesuaikan rekomendasi checklist, memproses dokumen, dan
            meningkatkan kualitas produk. Kami juga dapat mengirimkan pembaruan terkait fitur atau kebijakan yang relevan bagi
            bisnis Anda.
          </p>
        </section>

        <section className="space-y-4 border-b-2 border-black pb-6">
          <h2 className="font-heading text-2xl font-semibold">Berbagi Data dengan Pihak Ketiga</h2>
          <p>
            Kami tidak menjual data pribadi pengguna. Informasi hanya dibagikan kepada mitra tepercaya yang membantu operasional
            layanan (misalnya penyimpanan cloud, verifikasi dokumen) dan selalu tunduk pada kewajiban kerahasiaan.
          </p>
        </section>

        <section className="space-y-4 border-b-2 border-black pb-6">
          <h2 className="font-heading text-2xl font-semibold">Keamanan dan Retensi Data</h2>
          <p>
            Kami menerapkan kontrol keamanan berlapis untuk melindungi data Anda. Dokumen disimpan secara terenkripsi dan hanya
            disimpan selama diperlukan untuk tujuan layanan, kecuali jika Anda meminta penghapusan lebih awal.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Hubungi Kami</h2>
          <p>
            Untuk pertanyaan atau permintaan terkait privasi, silakan hubungi kami di <span className="font-semibold">support@aksaralegal.ai</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
