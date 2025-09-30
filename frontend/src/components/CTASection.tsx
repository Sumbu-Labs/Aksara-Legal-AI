import Link from 'next/link';

export function CTASection() {
  return (
    <section id="get-started" className="py-16 px-4 bg-primary text-center scroll-mt-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
          Siap Menghemat Waktu Administrasi Anda?
        </h2>
        <p className="text-lg md:text-xl text-white mb-8 opacity-90">
          Bergabunglah dengan ribuan UMKM yang telah menggunakan Aksara Legal AI untuk menyelesaikan perizinan dengan cepat dan mudah.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth?mode=register"
            className="bg-white text-primary px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-colors shadow-card"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/auth?mode=login"
            className="border-2 border-white text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-primary transition-colors"
          >
            Masuk
          </Link>
        </div>
      </div>
    </section>
  );
}
