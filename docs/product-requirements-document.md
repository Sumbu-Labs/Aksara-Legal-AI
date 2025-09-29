---

# Product Requirements Document: Aksara Legal AI

- **Version**: 2.2 (Final Clean Version: Corrected Epics & Business Model)
- **Date**: 28 September 2025
- **Competition Category**: Venture Creation – AI-powered startup and business solutions

---

# Product Requirements Document: Aksara Legal AI

## 1. Visi & Misi Produk

### Visi

Menjadi legal co-pilot yang terjangkau dan andal untuk UMKM dan startup di Indonesia dengan mengotomatiskan kepatuhan regulasi sehingga para founder dapat fokus pada pertumbuhan bisnis.

### Misi (Hackathon)

Mendemonstrasikan prototipe fungsional yang menampilkan kemampuan AI tidak hanya menjawab pertanyaan (Q&A) tetapi juga menghasilkan draf dokumen kepatuhan secara otomatis (Aksara Autopilot) dalam pengalaman SaaS end-to-end.

## 2. Analisis Masalah (The Problem)

UMKM dan startup tahap awal adalah mesin inovasi, namun mereka beroperasi dengan sumber daya yang sangat terbatas dan terhambat oleh "Tembok Birokrasi".

- **Kompleksitas Regulasi** – Proses perizinan (Halal, PIRT, BPOM, dan lainnya) penuh jargon hukum dengan alur tidak jelas.
- **Beban Administratif** – Founder menghabiskan puluhan jam mengisi formulir dan mengelola dokumen, mengurangi fokus pada produk/pelanggan.
- **Keterbatasan Anggaran** – Belum mampu mempekerjakan staf legal internal atau konsultan hukum untuk setiap kebutuhan.

> "Bagi startup dan UMKM, setiap jam dan setiap rupiah sangat berarti. Kami membangun Aksara Legal AI agar mereka tidak perlu lagi memilih antara pertumbuhan dan kepatuhan."

## 3. Solusi yang Diusulkan (The Solution)

Aksara Legal AI adalah platform web SaaS yang bertindak sebagai Asisten Kepatuhan Cerdas dan menghadirkan efisiensi 10x dibanding proses manual melalui tiga pilar utama:

1. **Personalized Checklist Generator** – Merekomendasikan izin sesuai profil bisnis.
2. **AI Q&A Assistant** – Menjawab pertanyaan regulasi spesifik memakai Gemini Pro.
3. **Aksara Autopilot (AI Document Generator)** – Menghasilkan draf formulir dan surat permohonan secara otomatis, memangkas 80% pekerjaan administratif.

## 4. Target Pengguna (User Persona)

- **Nama**: Sari Dewi
- **Profil**: Founder "Kopi Harapan" (UMKM berkembang di Sleman, DI Yogyakarta) atau founder startup teknologi dengan PT Perorangan.
- **Fokus**: Produk, pemasaran, dan operasional harian.
- **Frustrasi**: Tersesat saat mengurus izin PIRT dan Halal, kewalahan mengisi formulir serupa.
- **Keterbatasan**: Tidak memiliki anggaran untuk konsultan hukum; seluruh administrasi ditangani sendiri.

## 5. Tujuan & Metrik Keberhasilan (Hackathon Scope)

- **Tujuan Produk** – Membuktikan alur lengkap penemuan izin, Q&A AI, dan generasi dokumen otomatis, termasuk unggah dokumen, notifikasi, dan simulasi pembayaran.
- **Metrik Keberhasilan Demo** – Klik "Generate Dokumen" menampilkan pratinjau dokumen terisi tanpa gangguan.

## 6. Skenario Pengguna (User Stories)

### Epic: Onboarding & Setup

- **US-01** – Pengguna baru dapat mendaftar (nama, email, password).
- **US-02** – Pengguna terdaftar dapat login.
- **US-03** – Pengguna dapat logout untuk keamanan.
- **US-04** – Pengguna pertama kali login diarahkan mengisi profil bisnis (nama, jenis, skala, lokasi).

### Epic: Penemuan & Perencanaan Kepatuhan

- **US-05** – Pengguna dapat memulai analisis kepatuhan melalui tombol "Buat Checklist".
- **US-06** – Pengguna melihat daftar izin relevan (Halal, PIRT, BPOM) dalam kartu visual.
- **US-07** – Pengguna membuka detail izin dan mengakses Asisten AI khusus.

### Epic: Interaksi dengan Asisten AI

- **US-08** – Pengguna mengetik pertanyaan natural language di chatbox.
- **US-09** – Pengguna menerima jawaban AI yang jelas beserta sumber.

### Epic: Generasi Dokumen Otomatis (Aksara Autopilot)

- **US-17** – Pengguna melihat tombol "Buatkan Draf Dokumen" sesuai paket.
- **US-18** – AI membuat draf dokumen menggunakan data profil dan berkas terunggah.
- **US-19** – Pengguna dapat meninjau dan mengunduh dokumen (.html/.pdf).

### Epic: Manajemen Dokumen

- **US-10** – Pengguna memiliki halaman "Dokumen Saya" untuk unggah file penting (KTP, NIB).
- **US-11** – Pengguna melihat daftar dokumen (nama file, tanggal unggah).

### Epic: Tetap Terinformasi

- **US-12** – Pengguna melihat ikon notifikasi pembaruan.
- **US-13** – Pengguna membuka daftar notifikasi (misal "Checklist Anda sudah siap") dan menandainnya selesai.

### Epic: Upgrade Langganan

- **US-14** – Pengguna paket Gratis mengakses halaman harga dan perbandingan paket.
- **US-15** – Pengguna menekan "Upgrade" dan diarahkan ke simulasi pembayaran Midtrans.
- **US-16** – Setelah pembayaran berhasil, status akun berubah menjadi "Pro" disertai konfirmasi.

## 7. Lingkup & Fitur MVP (Scope & Features)

- **Fokus MVP** – Platform fungsional untuk UMKM & startup DI Yogyakarta (Sertifikasi Halal, PIRT, Izin Edar BPOM RI) dengan fitur unggulan Aksara Autopilot.
- **Daftar Fitur Teknis** – Modul 1–7: FEAT-001 sampai FEAT-040 (Autentikasi hingga Aksara Autopilot).

## 8. Arsitektur Teknis & Tech Stack

- **Frontend** – Next.js & Tailwind CSS.
- **Backend** – NestJS.
- **Database** – PostgreSQL + pgvector (hosted VM).
- **Layanan AI** – Python, FastAPI, Google AI Platform (Gemini Pro, Text Embedding).
- **Payment Gateway** – Midtrans (Sandbox).

> Arsitektur disesuaikan untuk visi yang difokuskan ulang dan mendukung pipeline RAG serta generasi dokumen.

## 9. Alur Demo untuk Presentasi

1. **0:00 – 0:45 | The Hook** – Ceritakan persona Sari dan waktu yang habis mengurus perizinan.
2. **0:45 – 3:30 | The Solution (Live Demo)**

    - Login, isi profil singkat, klik "Buat Checklist Saya", tampilkan tiga kartu izin.
    - Ajukan pertanyaan PIRT vs BPOM ke Asisten AI, tampilkan jawaban Gemini Pro.
    - Klik "Buatkan Draf Dokumen", tunjukkan pratinjau formulir PIRT yang otomatis terisi.
    - Tunjukkan alur upgrade paket dengan pembayaran Midtrans.

3. **3:30 – 4:00 | The Vision** – Skala produk untuk seluruh izin di Indonesia sebagai akselerator UMKM dan startup.

## 10. Tim & Peran (Struktur 3 Fullstack Developer)

- **Lead Fullstack Developer / Product Lead** – Menjaga visi produk, memimpin pitching/demo, mengembangkan layanan AI (Modul 3 & 7, pipeline RAG, Aksara Autopilot).
- **Fullstack Developer 1 (Frontend & User Journey)** – Mengimplementasikan UI/UX dari login hingga unduh dokumen.
- **Fullstack Developer 2 (Backend & Integrasi)** – Menyiapkan PostgreSQL + pgvector dan API untuk Autentikasi, Manajemen Dokumen, Notifikasi, Webhook Pembayaran.

## 11. Model Bisnis & Strategi Monetisasi

### Karakteristik Pasar Indonesia

- Sangat peka harga.
- Membeli jika nilai langsung terasa (hemat waktu/uang).
- Membutuhkan fleksibilitas karena kepatuhan bersifat sporadis.
- Harga di bawah Rp 100.000 dipersepsikan sebagai pembelian rendah risiko.

### Strategi Monetisasi Hibrida

1. **Freemium** – Akuisisi & edukasi; paket Gratis fungsional membangun kepercayaan.
2. **Pay-per-Permit** – Solusi transaksional untuk kebutuhan mendesak dengan konversi tinggi.
3. **Subscription** – Retensi & pertumbuhan bagi bisnis mapan yang butuh kepatuhan berkelanjutan.

### Struktur Harga & Nilai

| Paket | Harga | Asisten AI Q&A | Unggah Dokumen | Aksara Autopilot™ | Checklist Izin |
| --- | --- | --- | --- | --- | --- |
| Gratis (Coba Dulu) | Rp 0 | 10 pertanyaan/bulan | 3 dokumen | ❌ | ✅ |
| Satuan (Bayar per Izin) | Rp 75.000 / izin | Tak terbatas* | Tak terbatas* | 1× generate/izin | ✅ |
| Pro (Langganan Tahunan) | Rp 49.000 / bulan (Rp 588.000/tahun) | Tak terbatas | Tak terbatas | Tak terbatas | ✅ |

\*Tak terbatas untuk izin yang dibeli.

#### Rasionalisasi Harga

- **Gratis** – Menghilangkan hambatan masuk; 10 pertanyaan cukup menunjukkan nilai AI.
- **Rp 75.000 / Izin** – >85% lebih murah dibanding konsultan (Rp 500.000–1.500.000); berada di bawah ambang psikologis Rp 100.000.
- **Rp 49.000 / Bulan** – Jika butuh 4 izin/tahun, paket Satuan = Rp 300.000; langganan Rp 588.000 memberi akses penuh dan ketenangan pikiran.

### Alur Konversi & Visi Jangka Panjang

- Pengguna seperti Sari mulai dengan paket Gratis → membeli paket Satuan untuk sertifikasi Halal → beralih ke Pro saat bisnis berkembang.
- Setelah tervalidasi, bangun **Aksara Partner Network** (marketplace konsultan/agen perizinan lokal) dengan model komisi untuk menciptakan ekosistem kepatuhan menyeluruh.
