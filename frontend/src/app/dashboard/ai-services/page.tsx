import type { JSX } from 'react';

const workflowSteps = [
  {
    title: 'Mulai dari tujuan',
    description:
      'Chatbot menanyakan objektif utama Anda—apakah ingin ekspansi produk, memperbarui izin, atau menyiapkan operasional baru.',
  },
  {
    title: 'Analisis profil bisnis',
    description:
      'AI membaca profil usaha, status perizinan, dan dokumen pendukung untuk memahami konteks sebelum menyusun rekomendasi.',
  },
  {
    title: 'Susun task & dokumen dinamis',
    description:
      'Berdasarkan analisis dan RAG terhadap regulasi resmi, AI menghasilkan daftar tugas serta draf dokumen yang relevan.',
  },
  {
    title: 'Kolaborasi dan eksekusi',
    description:
      'Anda memverifikasi, memberi persetujuan, dan AI mengotomasi pembuatan dokumen; Aksara Autopilot dapat mengeksekusi tugas end-to-end.',
  },
];

const workspaceHighlights = [
  {
    title: 'Chatbot terpadu',
    description:
      'Satu antarmuka percakapan untuk semua kebutuhan legal dan operasional. Riwayat percakapan tersinkronisasi dengan status tugas.',
  },
  {
    title: 'Daftar tugas adaptif',
    description:
      'Task list berubah mengikuti analisis AI—dari pengumpulan data, drafting surat, hingga penjadwalan pengajuan izin.',
  },
  {
    title: 'Automasi dokumen',
    description:
      'AI menyusun draf perizinan, surat pernyataan, dan lampiran dengan data usaha Anda sehingga tinggal ditinjau dan disetujui.',
  },
];

const documentAutomationFlow = [
  {
    title: 'Formulir dinamis',
    description:
      'Bidang formulir menyesuaikan kebutuhan setiap surat resmi—mulai dari data pemilik usaha hingga rincian kegiatan.',
  },
  {
    title: 'Preview PDF langsung',
    description:
      'Draf HTML dirender ke PDF secara real-time sehingga Anda bisa meninjau tata letak, bahasa hukum, dan kelengkapan lampiran.',
  },
  {
    title: 'Satu klik ekspor',
    description:
      'Setelah disetujui, AI menghasilkan PDF final lengkap dengan nomor referensi dan siap untuk diajukan ke instansi resmi.',
  },
];

const collaborationModes = [
  {
    mode: 'Aksara Copilot (Chatbot)',
    description:
      'AI menuntun Anda langkah demi langkah. Anda mengunggah atau memilih dokumen, memberi klarifikasi, dan menyetujui hasil sebelum dikirim.',
    points: [
      'Percakapan kontekstual dengan referensi regulasi otomatis.',
      'Task list prioritas dengan status jelas (To Do, In Review, Done).',
      'Aksi manual seperti tanda tangan dan pengesahan tetap di tangan Anda.',
    ],
  },
  {
    mode: 'Aksara Autopilot (Agentic)',
    description:
      'Agent AI mengeksekusi tugas kompleks secara otomatis: mengumpulkan data, mengisi formulir daring, dan mengirim dokumen dengan pengawasan minimal.',
    points: [
      'Memanfaatkan API dan integrasi internal untuk eksekusi end-to-end.',
      'Membuat laporan progres otomatis yang dapat Anda tinjau kapan saja.',
      'Anda hanya perlu memberikan persetujuan akhir atau input krusial.',
    ],
  },
];

export default function DashboardAiServicesPage(): JSX.Element {
  return (
    <main className="mx-auto w-full max-w-6xl px-8 py-12 text-neutral-dark">
      <header className="border-b-2 border-black pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">AI Services</p>
        <h1 className="mt-4 font-heading text-4xl text-neutral-dark">Workspace AI Terpadu</h1>
        <p className="mt-3 max-w-3xl text-sm text-neutral-mid">
          Tinggalkan katalog izin terpisah. Aksara menghadirkan satu chatbot yang menganalisis profil bisnis Anda, menyusun task list
          adaptif, dan mengotomasi pembuatan dokumen hukum maupun operasional.
        </p>
      </header>

      <section className="mt-12 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6 rounded-lg border-2 border-black bg-white p-6 shadow-card">
          <div className="rounded-md border border-dashed border-neutral-mid/60 bg-secondary/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-mid">Preview</p>
            <h2 className="mt-2 font-heading text-2xl">Chatbot &amp; Task Board</h2>
            <p className="mt-3 text-sm text-neutral-mid">
              Antarmuka percakapan berada di sisi kiri, sedangkan daftar tugas dan dokumen dinamis di kanan. Pengguna memilih tujuan,
              AI melakukan analisis, kemudian mengisi task list dengan tindakan konkret seperti &ldquo;Verifikasi legalitas usaha&rdquo;
              atau &ldquo;Tinjau draf NIB&rdquo; lengkap dengan status dan tenggat.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workspaceHighlights.map((item) => (
              <article key={item.title} className="border border-black/10 bg-secondary/40 p-4">
                <h3 className="font-heading text-lg text-neutral-dark">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-mid">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="border-2 border-black bg-primary px-5 py-6 text-white">
            <h2 className="font-heading text-2xl">Mulai dari percakapan</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Pilih objektif, unggah dokumen pendukung, dan biarkan AI menyusun rencana otomatis.
            </p>
            <button className="mt-5 inline-flex w-full items-center justify-center border-2 border-white bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20">
              Luncurkan Aksara Copilot
            </button>
          </div>

          <div className="border-2 border-black bg-white p-5 text-sm text-neutral-mid">
            <h3 className="font-heading text-lg text-neutral-dark">Intuisi AI</h3>
            <p className="mt-2">
              Saat tujuan dipilih, AI menjalankan RAG ke dokumen resmi, mengecek sertifikat yang dimiliki, dan menyarankan apa yang
              perlu ditindaklanjuti—dengan prioritas dan estimasi waktu otomatis.
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6 rounded-lg border-2 border-black bg-white p-6 shadow-card">
          <div className="rounded-md border border-neutral-mid/40 bg-secondary/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-mid">Aksara Copilot</p>
            <h2 className="mt-2 font-heading text-2xl">Penyusun Dokumen Interaktif</h2>
            <p className="mt-3 text-sm text-neutral-mid">
              Copilot menyiapkan ruang kerja dua panel: formulir fleksibel di kiri dan preview PDF di kanan. Pengguna cukup melengkapi data,
              meninjau hasil, lalu menyetujui untuk diekspor atau dilanjutkan ke Autopilot.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3 rounded-md border border-dashed border-neutral-mid/60 bg-white p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Form Input</span>
              <h3 className="font-heading text-lg text-neutral-dark">Field menyesuaikan kebutuhan dokumen</h3>
              <p className="text-sm text-neutral-mid">
                AI memilih komponen formulir yang relevan—checkbox legalitas, upload lampiran, maupun tanggal kadaluarsa sertifikat.
              </p>
              <p className="text-sm text-neutral-mid">
                Validasi otomatis memastikan data wajib terisi sebelum tombol <strong>Kirim ke Pemerintah</strong> dapat diaktifkan.
              </p>
            </div>
            <div className="space-y-3 rounded-md border border-primary bg-primary/5 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Preview PDF</span>
              <h3 className="font-heading text-lg text-neutral-dark">Render langsung dari HTML</h3>
              <p className="text-sm text-neutral-mid">
                Perubahan formulir langsung memutakhirkan PDF. Pengguna bisa zoom, unduh, atau meminta AI menyesuaikan bahasa hukum.
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border-2 border-black bg-white p-5 text-sm text-neutral-mid">
            <h3 className="font-heading text-lg text-neutral-dark">Bagaimana prosesnya?</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {documentAutomationFlow.map((item) => (
                <li key={item.title} className="marker:text-primary">
                  <p className="font-semibold text-neutral-dark">{item.title}</p>
                  <p className="text-neutral-mid">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-2 border-dashed border-primary/60 bg-primary/5 p-5 text-sm text-neutral-mid">
            <h3 className="font-heading text-lg text-neutral-dark">Kapan aktifkan Autopilot?</h3>
            <p className="mt-2">
              Saat seluruh data sudah disetujui, Anda dapat mengalihkan ke Autopilot untuk eksekusi submission—termasuk unggah ke portal
              pemerintah dan penjadwalan pengambilan dokumen fisik.
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-12 border-2 border-black bg-secondary/40 px-6 py-8">
        <h2 className="font-heading text-2xl text-neutral-dark">Alur kerja yang direkayasa ulang</h2>
        <p className="mt-3 max-w-3xl text-sm text-neutral-mid">
          Chatbot tunggal menjadi pusat koordinasi. Ia memetakan kebutuhan legal dan operasional tanpa pengguna harus memilah manual
          regulasi atau sertifikat.
        </p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <li key={step.title} className="border border-black/10 bg-white/80 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Langkah {index + 1}</span>
              <h3 className="mt-2 font-heading text-lg text-neutral-dark">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-mid">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        {collaborationModes.map((mode) => (
          <article key={mode.mode} className="flex h-full flex-col gap-4 border-2 border-black bg-white p-6 shadow-card">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Kolaborasi</span>
            <h3 className="font-heading text-2xl text-neutral-dark">{mode.mode}</h3>
            <p className="text-sm text-neutral-mid">{mode.description}</p>
            <ul className="flex-1 list-disc space-y-2 pl-5 text-sm text-neutral-mid">
              {mode.points.map((point) => (
                <li key={point} className="marker:text-primary">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-12 border-2 border-dashed border-primary px-6 py-8 text-sm text-neutral-mid">
        <h2 className="font-heading text-2xl text-neutral-dark">Hasil akhir</h2>
        <p className="mt-3 max-w-4xl">
          Dengan AI yang menilai kebutuhan secara otomatis, setiap percakapan menghasilkan daftar tugas prioritas, dokumen yang siap
          diajukan, dan pilihan untuk mengaktifkan Autopilot ketika Anda ingin proses berlangsung mandiri.
        </p>
      </section>
    </main>
  );
}
