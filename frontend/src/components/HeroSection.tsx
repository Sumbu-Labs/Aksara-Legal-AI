export function HeroSection() {
  return (
    <section className="min-h-screen px-4 py-16 bg-background">
      <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-6">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-dark leading-tight">
            Singkirkan kerumitan perizinan dengan co-pilot legal berbasis AI
          </h1>
          <p className="text-lg md:text-xl text-neutral-mid">
            Aksara Legal AI membantu UMKM dan startup memetakan kewajiban regulasi, menyusun checklist, dan menghasilkan draf dokumen dalam hitungan menit.
          </p>
          <a
            href="/register"
            className="inline-flex w-fit items-center justify-center bg-primary text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-primary-dark transition-colors shadow-card"
          >
            Mulai Sekarang
          </a>
        </div>

        <div className="aspect-square border-2 border-neutral-light bg-white shadow-card" aria-hidden="true" />
      </div>
    </section>
  );
}
