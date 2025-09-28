import { SectionSeparatorHorizontal } from '../components/SectionSeparator';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-dark mb-6 max-w-4xl">
          Aksara Legal AI: Legal Co-Pilot untuk UMKM & Startup
        </h1>
        <p className="text-lg md:text-xl text-neutral-mid mb-8 max-w-2xl">
          Otomatiskan kepatuhan regulasi agar Anda fokus pada pertumbuhan bisnis. Hemat waktu dan biaya dengan asisten AI cerdas.
        </p>
        <blockquote className="text-base md:text-lg italic text-neutral-mid mb-8 max-w-xl border-l-4 border-primary pl-4">
          "Bagi startup dan UMKM, setiap jam dan setiap rupiah sangat berarti."
        </blockquote>
        <a
          href="/register"
          className="bg-primary text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-primary-dark transition-colors shadow-card"
        >
          Mulai Sekarang
        </a>
      </section>

      <SectionSeparatorHorizontal />

      {/* Problem Section */}
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

      <SectionSeparatorHorizontal />

      {/* Solution Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-12">
            Solusi Lengkap untuk Kepatuhan Regulasi
          </h2>
          <p className="text-lg md:text-xl text-neutral-mid mb-12 max-w-3xl mx-auto">
            Aksara Legal AI mengotomatiskan proses perizinan dengan tiga pilar utama, menghemat hingga 80% waktu administrasi.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-secondary p-6 border-black border-2 shadow-card">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-neutral-dark mb-4">Checklist Generator</h3>
              <p className="text-neutral-mid">
                Dapatkan checklist langkah demi langkah yang disesuaikan dengan jenis usaha Anda. Panduan jelas untuk setiap dokumen yang dibutuhkan.
              </p>
            </div>
            <div className="bg-secondary p-6 border-black border-2 shadow-card">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-neutral-dark mb-4">AI Q&A</h3>
              <p className="text-neutral-mid">
                Tanyakan pertanyaan hukum kapan saja. AI kami memberikan jawaban akurat dalam bahasa yang mudah dipahami.
              </p>
            </div>
            <div className="bg-secondary p-6 border-black border-2 shadow-card">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-neutral-dark mb-4">Aksara Autopilot</h3>
              <p className="text-neutral-mid">
                Biarkan AI membuat draf dokumen perizinan untuk Anda. Edit dan sesuaikan sebelum kirim ke instansi terkait.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparatorHorizontal />

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-12 text-center">
            Cara Kerja Aksara Legal AI
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="text-center border-black border-2 bg-secondary p-6 shadow-card">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-lg">1</div>
              <h3 className="font-heading text-lg font-semibold text-neutral-dark mb-2">Daftar</h3>
              <p className="text-sm text-neutral-mid">Buat akun gratis dalam hitungan menit</p>
            </div>
            <div className="text-center border-black border-2 bg-secondary p-6 shadow-card">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-lg">2</div>
              <h3 className="font-heading text-lg font-semibold text-neutral-dark mb-2">Profile</h3>
              <p className="text-sm text-neutral-mid">Isi profil usaha Anda</p>
            </div>
            <div className="text-center border-black border-2 bg-secondary p-6 shadow-card">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-lg">3</div>
              <h3 className="font-heading text-lg font-semibold text-neutral-dark mb-2">Checklist</h3>
              <p className="text-sm text-neutral-mid">Dapatkan checklist perizinan</p>
            </div>
            <div className="text-center border-black border-2 bg-secondary p-6 shadow-card">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-lg">4</div>
              <h3 className="font-heading text-lg font-semibold text-neutral-dark mb-2">AI Chat</h3>
              <p className="text-sm text-neutral-mid">Tanyakan pertanyaan hukum</p>
            </div>
            <div className="text-center border-black border-2 bg-secondary p-6 shadow-card">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-lg">5</div>
              <h3 className="font-heading text-lg font-semibold text-neutral-dark mb-2">Generate</h3>
              <p className="text-sm text-neutral-mid">Buat draf dokumen</p>
            </div>
            <div className="text-center border-black border-2 bg-secondary p-6 shadow-card">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-lg">6</div>
              <h3 className="font-heading text-lg font-semibold text-neutral-dark mb-2">Upgrade</h3>
              <p className="text-sm text-neutral-mid">Tingkatkan untuk fitur premium</p>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparatorHorizontal />

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Menghemat Waktu Administrasi Anda?
          </h2>
          <p className="text-lg md:text-xl text-white mb-8 opacity-90">
            Bergabunglah dengan ribuan UMKM yang telah menggunakan Aksara Legal AI untuk menyelesaikan perizinan dengan cepat dan mudah.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-primary px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-colors shadow-card"
            >
              Daftar Gratis
            </a>
            <a
              href="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-primary transition-colors"
            >
              Masuk
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-secondary border-t-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-heading text-2xl font-bold text-neutral-dark mb-4">Aksara Legal AI</h3>
              <p className="text-neutral-mid mb-4">
                Legal Co-Pilot untuk UMKM & Startup Indonesia. Otomatiskan kepatuhan regulasi dengan AI cerdas.
              </p>
              <p className="text-sm text-neutral-mid">
                © 2025 Aksara Legal AI. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-dark mb-4">Produk</h4>
              <ul className="space-y-2 text-neutral-mid">
                <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="/documents" className="hover:text-primary transition-colors">Dokumen</a></li>
                <li><a href="/pricing" className="hover:text-primary transition-colors">Harga</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-dark mb-4">Dukungan</h4>
              <ul className="space-y-2 text-neutral-mid">
                <li><a href="/help" className="hover:text-primary transition-colors">Bantuan</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Kontak</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privasi</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
