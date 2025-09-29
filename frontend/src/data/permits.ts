export type PermitSlug = 'halal' | 'pirt' | 'bpom';

export type PermitDefinition = {
  slug: PermitSlug;
  name: string;
  shortName: string;
  summary: string;
  heroTagline: string;
  highlights: string[];
  samplePrompts: string[];
  permitType: 'HALAL' | 'PIRT' | 'BPOM';
  region: string;
};

const PERMITS: Record<PermitSlug, PermitDefinition> = {
  halal: {
    slug: 'halal',
    name: 'Sertifikasi Halal',
    shortName: 'Halal',
    summary:
      'Panduan end-to-end untuk memenuhi standar Badan Penyelenggara Jaminan Produk Halal (BPJPH), mulai dari prasyarat usaha hingga audit lapangan.',
    heroTagline: 'Pastikan rantai pasokan dan proses produksi sesuai tuntunan halal sebelum diaudit BPJPH.',
    highlights: [
      'Wajib bagi UMKM pangan dan minuman yang ingin menembus pasar modern atau ekspor.',
      'Membutuhkan dokumen bahan baku, proses produksi, dan sertifikasi penyelia halal.',
      'Proses reguler mencakup pendaftaran di SIHALAL, pemeriksaan oleh LPH, dan penerbitan sertifikat oleh BPJPH.',
    ],
    samplePrompts: [
      'Apa saja dokumen awal yang harus saya siapkan untuk sertifikasi halal?',
      'Berapa lama proses sertifikasi halal jika usaha saya skala rumah tangga?',
      'Bagaimana cara menyiapkan audit LPH agar berjalan lancar?',
    ],
    permitType: 'HALAL',
    region: 'DIY',
  },
  pirt: {
    slug: 'pirt',
    name: 'Sertifikat PIRT',
    shortName: 'PIRT',
    summary:
      'Bimbingan untuk memperoleh Sertifikat Produksi Pangan Industri Rumah Tangga dari Dinas Kesehatan kabupaten/kota.',
    heroTagline: 'Lengkapi keamanan pangan rumahan Anda dengan standar higienitas Dinkes.',
    highlights: [
      'Wajib bagi pelaku usaha pangan olahan siap edar berskala rumah tangga.',
      'Memerlukan surat keterangan sehat, hasil uji laboratorium sederhana, dan label produk.',
      'Pelatihan keamanan pangan dan pemeriksaan sarana produksi merupakan tahap kunci.',
    ],
    samplePrompts: [
      'Apa perbedaan persyaratan PIRT dan BPOM untuk produk minuman?',
      'Siapa yang menyelenggarakan pelatihan keamanan pangan PIRT di daerah saya?',
      'Apa saja poin pemeriksaan saat inspeksi sarana produksi PIRT?',
    ],
    permitType: 'PIRT',
    region: 'DIY',
  },
  bpom: {
    slug: 'bpom',
    name: 'Izin Edar BPOM RI',
    shortName: 'BPOM',
    summary:
      'Checklist regulasi untuk mendaftarkan produk pangan olahan ke BPOM RI melalui e-Registrasi.',
    heroTagline: 'Siapkan dokumen keamanan dan mutu produk agar lolos evaluasi BPOM.',
    highlights: [
      'Diperlukan bagi produk pangan olahan yang dipasarkan secara luas di wilayah Indonesia.',
      'Mengharuskan hasil uji laboratorium lengkap, kajian label gizi, dan bukti fasilitas produksi tersertifikasi.',
      'Proses mencakup pengunggahan dokumen ke e-Registrasi, verifikasi, dan penerbitan nomor izin edar (ML/MD).',
    ],
    samplePrompts: [
      'Apa saja dokumen teknis yang wajib diunggah saat registrasi BPOM?',
      'Bagaimana menyesuaikan label gizi agar sesuai panduan BPOM terbaru?',
      'Berapa estimasi biaya pengujian laboratorium untuk izin edar BPOM?',
    ],
    permitType: 'BPOM',
    region: 'DIY',
  },
};

export const permitSlugs = Object.keys(PERMITS) as PermitSlug[];

export function getPermitBySlug(slug: string): PermitDefinition | undefined {
  const normalized = slug.toLowerCase() as PermitSlug;
  return PERMITS[normalized];
}

export function listPermits(): PermitDefinition[] {
  return permitSlugs.map((slug) => PERMITS[slug]);
}
