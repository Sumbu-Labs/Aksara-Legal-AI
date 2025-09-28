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
    </div>
  );
}
