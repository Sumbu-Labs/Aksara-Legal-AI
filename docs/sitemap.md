# Aksara Legal AI - Sitemap & Arsitektur Informasi

Dokumen ini berfungsi sebagai cetak biru arsitektur informasi untuk aplikasi Aksara Legal AI. Tujuannya adalah untuk memandu tim developer (frontend dan backend) dalam membangun halaman (pages), rute (routes), dan komponen yang diperlukan sesuai dengan Product Requirements Document (PRD).

## Prinsip Panduan (Guiding Principles)

- **Struktur Logis:** Struktur URL harus prediktif, mudah dibaca, dan merefleksikan hierarki data aplikasi.
- **Pemisahan Konteks:** Terdapat pemisahan yang jelas antara rute publik (untuk marketing dan akuisisi) dan rute terproteksi (aplikasi inti untuk pengguna yang sudah login).
- **Fokus pada Pengguna:** Setiap halaman dirancang untuk memenuhi tujuan spesifik dalam alur perjalanan pengguna, dari penemuan hingga penyelesaian tugas.

---

## 1. Rute Publik (Public Routes)

Halaman-halaman ini dapat diakses oleh siapa saja tanpa perlu login. Fokus utamanya adalah untuk akuisisi dan konversi pengguna baru.

### `/` (Homepage / Landing Page)

- **Tujuan:** Menjelaskan nilai proposisi Aksara Legal AI, menargetkan persona Sari Dewi, dan mendorong pendaftaran.
- **Fitur Utama:**
  - Hero section dengan headline yang kuat.
  - Penjelasan 3 pilar utama (Personalized Checklist, AI Q&A, Aksara Autopilot).
  - CTA (Call-to-Action) utama untuk mendaftar (`/auth/register`) dan melihat harga (`/harga`).
- **Catatan Teknis:** Halaman statis, dioptimalkan untuk SEO dan kecepatan muat.

### `/harga` (Pricing Page)

- **Tujuan:** Menyajikan perbandingan paket (Gratis, Satuan, Pro) secara transparan untuk mendorong pengguna memilih paket yang sesuai. (Lihat US-14)
- **Fitur Utama:**
  - Tabel perbandingan fitur antar paket.
  - Rasionalisasi harga dan kalkulasi nilai (value).
  - CTA "Pilih Paket" untuk setiap opsi.
- **Catatan Teknis:** CTA dapat mengarahkan ke halaman registrasi dengan parameter URL (misal: `/auth/register?plan=pro`).

### `/auth/` (Authentication Group)

- **Tujuan:** Menyediakan alur pendaftaran dan login yang aman dan lancar.
- **Catatan Teknis:** Direkomendasikan menggunakan *route group* di Next.js untuk layout yang terpisah dari aplikasi utama.

#### `/auth/login`

- **Tujuan:** Memungkinkan pengguna terdaftar untuk masuk ke akun mereka. (Lihat US-02)
- **Fitur:** Form email & password, link "Lupa Password?", link ke halaman registrasi.

#### `/auth/register`

- **Tujuan:** Memungkinkan pengguna baru untuk membuat akun. (Lihat US-01)
- **Fitur:** Form nama, email, password, dan persetujuan syarat & ketentuan.

#### `/auth/forgot-password` & `/auth/reset-password`

- **Tujuan:** Alur standar untuk pemulihan akun.
- **Fitur:** Form untuk mengirim email reset dan form untuk memasukkan password baru.

---

## 2. Rute Terproteksi (Authenticated Routes)

Halaman-halaman ini membentuk aplikasi inti dan hanya dapat diakses oleh pengguna yang sudah login.

**Catatan Teknis:** Semua rute di bawah ini wajib dilindungi oleh *authentication middleware*.

### `/dashboard`

- **Tujuan:** Menjadi pusat kendali utama setelah login, menampilkan ringkasan status kepatuhan dan panduan langkah selanjutnya.
- **Fitur Utama:**
  - Tampilan kartu visual untuk izin yang direkomendasikan (Halal, PIRT, dll.). (Lihat US-06)
  - Tombol "Buat Checklist" jika checklist belum dibuat. (Lihat US-05)
- **Catatan Teknis:** Melakukan fetch data profil pengguna dan checklist izin saat dimuat.

### `/onboarding`

- **Tujuan:** Mengumpulkan data profil bisnis pengguna baru untuk personalisasi rekomendasi. (Lihat US-04)
- **Fitur Utama:** Form multi-langkah untuk mengisi detail bisnis (nama, jenis, skala, lokasi).
- **Catatan Teknis:** Rute ini hanya diakses sekali setelah registrasi. Setelah selesai, pengguna diarahkan ke `/dashboard`.

### `/izin/:id` (Contoh: `/izin/pirt`)

- **Tujuan:** Halaman detail yang menjadi pusat informasi dan aksi untuk satu jenis izin spesifik. (Lihat US-07)
- **Fitur Utama:**
  - Informasi detail mengenai izin.
  - Komponen **AI Q&A Assistant** (chatbox). (Lihat US-08, US-09)
  - Tombol **"Buatkan Draf Dokumen" (Aksara Autopilot)**. (Lihat US-17)
- **Catatan Teknis:** Rute dinamis. `:id` adalah *slug* untuk jenis izin. Tombol Autopilot harus memeriksa status langganan pengguna.

### `/dokumen`

- **Tujuan:** Satu tempat terpusat bagi pengguna untuk mengelola (mengunggah, melihat) dokumen pendukung mereka.
- **Fitur Utama:**
  - Fungsi unggah file (KTP, NIB, dll.). (Lihat US-10)
  - Daftar dokumen yang telah diunggah. (Lihat US-11)
- **Catatan Teknis:** Memerlukan integrasi dengan layanan penyimpanan objek (seperti S3 atau GCS).

### `/pengaturan/` (Settings Group)

- **Tujuan:** Memberikan pengguna kontrol penuh atas data akun dan langganan mereka.

#### `/pengaturan/profil`

- **Fitur:** Form untuk mengubah data personal (nama, email, password).

#### `/pengaturan/bisnis`

- **Fitur:** Form untuk mengedit kembali data profil bisnis yang diisi saat onboarding.

#### `/pengaturan/langganan`

- **Fitur:** Menampilkan status langganan saat ini, riwayat pembayaran, dan opsi untuk upgrade/mengelola langganan. (Lihat US-16)

### `/upgrade`

- **Tujuan:** Menyediakan alur pembayaran yang aman dan jelas saat pengguna memutuskan untuk upgrade. (Lihat US-15)
- **Fitur Utama:**
  - Ringkasan pesanan (paket yang dipilih).
  - Integrasi widget pembayaran (Midtrans Snap.js).
- **Catatan Teknis:** Memerlukan implementasi callback dan webhook di backend untuk konfirmasi pembayaran.

---

## 3. Komponen Global & Non-Halaman

Elemen-elemen ini bukan halaman tersendiri, tetapi merupakan bagian penting dari UI/UX yang muncul di berbagai halaman.

### Authenticated Layout (Shell)

- **Deskripsi:** Wrapper/kerangka utama untuk semua rute terproteksi, memastikan tampilan yang konsisten.
- **Komponen Anak:** Header, Sidebar Navigasi, dan area konten utama.

### Header

- **Deskripsi:** Bar bagian atas yang persisten di seluruh rute terproteksi.
- **Fitur:** Logo, **Ikon Notifikasi (Lonceng)**, dan menu dropdown pengguna (link ke Pengaturan, Logout). (Lihat US-12)

### Panel Notifikasi

- **Deskripsi:** Dropdown/panel yang muncul saat ikon lonceng diklik, menampilkan daftar notifikasi. (Lihat US-13)
- **Catatan Teknis:** Komponen ini melakukan fetch data notifikasi secara independen.

### Modal Pratinjau Dokumen

- **Deskripsi:** Sebuah modal window yang muncul setelah proses Aksara Autopilot selesai.
- **Fitur:** Menampilkan pratinjau dokumen yang dihasilkan, dan tombol "Unduh". (Lihat US-19)
- **Catatan Teknis:** Komponen yang dipicu oleh *event* pada sisi klien, bukan sebuah rute.
