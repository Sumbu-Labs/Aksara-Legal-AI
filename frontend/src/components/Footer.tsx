export function Footer() {
  return (
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
            <h4 className="font-semibold text-neutral-dark text-2xl mb-4">Produk</h4>
            <ul className="space-y-3 text-neutral-mid text-lg font-medium">
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
              <li><a href="/documents" className="hover:text-primary transition-colors">Dokumen</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">Harga</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-dark text-2xl mb-4">Dukungan</h4>
            <ul className="space-y-3 text-neutral-mid text-lg font-medium">
              <li><a href="/help" className="hover:text-primary transition-colors">Bantuan</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Kontak</a></li>
              <li><a href="/privacy" className="hover:text-primary transition-colors">Privasi</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
