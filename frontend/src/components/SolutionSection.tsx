export function SolutionSection() {
  return (
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
  );
}