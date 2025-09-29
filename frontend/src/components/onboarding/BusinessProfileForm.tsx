'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import type { JSX } from 'react';

type BusinessSize = 'micro' | 'small' | 'medium' | 'enterprise';

export type BusinessProfileFormValues = {
  businessName: string;
  businessType: string;
  businessSize: BusinessSize;
  businessLocation: string;
  mainProducts: string;
};

type BusinessProfileFormProps = {
  initialValues?: Partial<BusinessProfileFormValues>;
  onSubmit: (values: BusinessProfileFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

type ValidationErrors = Partial<Record<keyof BusinessProfileFormValues, string>>;

const DEFAULT_VALUES: BusinessProfileFormValues = {
  businessName: '',
  businessType: '',
  businessSize: 'micro',
  businessLocation: '',
  mainProducts: '',
};

function validate(values: BusinessProfileFormValues): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!values.businessName.trim()) {
    errors.businessName = 'Nama bisnis wajib diisi.';
  }
  if (!values.businessType.trim()) {
    errors.businessType = 'Pilih jenis usaha Anda.';
  }
  if (!values.businessLocation.trim()) {
    errors.businessLocation = 'Pilih domisili utama bisnis.';
  }
  if (!values.mainProducts.trim()) {
    errors.mainProducts = 'Tuliskan produk atau layanan utama.';
  }
  return errors;
}

const BUSINESS_TYPES = [
  'Makanan & Minuman',
  'Kecantikan & Perawatan Diri',
  'Kesehatan & Obat Tradisional',
  'Produk Rumah Tangga',
  'Pertanian & Pangan Segar',
  'Lainnya',
];

const BUSINESS_LOCATIONS = [
  'DKI Jakarta',
  'DI Yogyakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Sumatera Utara',
  'Sulawesi Selatan',
  'Lainnya',
];

export const BUSINESS_SIZE_LABEL: Record<BusinessSize, string> = {
  micro: 'Mikro (1-5 karyawan)',
  small: 'Kecil (6-19 karyawan)',
  medium: 'Menengah (20-99 karyawan)',
  enterprise: 'Menengah-Besar (100+ karyawan)',
};

const BUSINESS_SIZES: BusinessSize[] = ['micro', 'small', 'medium', 'enterprise'];

export function BusinessProfileForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
}: BusinessProfileFormProps): JSX.Element {
  const mergedDefaults = useMemo(
    () => ({ ...DEFAULT_VALUES, ...initialValues }),
    [initialValues],
  );

  const [values, setValues] = useState<BusinessProfileFormValues>(mergedDefaults);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    onSubmit(values);
  };

  const handleChange = (
    key: keyof BusinessProfileFormValues,
    value: string,
  ) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <section className="space-y-4 border-2 border-black bg-white px-6 py-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Langkah 1
          </p>
          <h2 className="font-heading text-3xl text-neutral-dark">
            Profilkan Bisnis Anda
          </h2>
          <p className="max-w-xl text-sm text-neutral-mid">
            Data ini membantu Aksara Legal AI mempersonalisasi checklist izin dan rekomendasi dokumen yang relevan.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="business-name">
              Nama Bisnis
            </label>
            <input
              id="business-name"
              name="businessName"
              value={values.businessName}
              onChange={(event) => handleChange('businessName', event.target.value)}
              placeholder="Contoh: Kopi Harapan"
              className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none focus:ring-0 rounded-none"
            />
            {errors.businessName && (
              <p className="text-sm text-danger">{errors.businessName}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="business-type">
              Jenis Usaha
            </label>
            <select
              id="business-type"
              name="businessType"
              value={values.businessType}
              onChange={(event) => handleChange('businessType', event.target.value)}
              className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none rounded-none"
            >
              <option value="" disabled>
                Pilih jenis usaha
              </option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.businessType && (
              <p className="text-sm text-danger">{errors.businessType}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-neutral-dark">
              Skala Operasi
            </span>
            <div className="grid grid-cols-1 gap-2">
              {BUSINESS_SIZES.map((size) => (
                <label
                  key={size}
                  className={`flex cursor-pointer items-center justify-between border-2 border-black px-4 py-3 text-sm transition-colors ${
                    values.businessSize === size ? 'bg-secondary text-neutral-dark' : 'bg-white text-neutral-dark'
                  }`}
                >
                  <span>{BUSINESS_SIZE_LABEL[size]}</span>
                  <input
                    type="radio"
                    className="h-4 w-4 border-2 border-black text-primary focus:ring-0"
                    name="businessSize"
                    value={size}
                    checked={values.businessSize === size}
                    onChange={(event) => handleChange('businessSize', event.target.value as BusinessSize)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="business-location">
              Domisili Utama
            </label>
            <select
              id="business-location"
              name="businessLocation"
              value={values.businessLocation}
              onChange={(event) => handleChange('businessLocation', event.target.value)}
              className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none rounded-none"
            >
              <option value="" disabled>
                Pilih provinsi
              </option>
              {BUSINESS_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.businessLocation && (
              <p className="text-sm text-danger">{errors.businessLocation}</p>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-neutral-dark" htmlFor="main-products">
              Produk atau Layanan Utama
            </label>
            <textarea
              id="main-products"
              name="mainProducts"
              value={values.mainProducts}
              onChange={(event) => handleChange('mainProducts', event.target.value)}
              placeholder="Contoh: Kopi literan ready-to-drink, biji kopi house blend, paket kemitraan kedai kecil"
              rows={4}
              className="w-full border-2 border-black bg-white px-4 py-3 text-base text-neutral-dark focus:border-primary focus:outline-none rounded-none"
            />
            {errors.mainProducts && (
              <p className="text-sm text-danger">{errors.mainProducts}</p>
            )}
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-4">
        <p className="text-sm text-neutral-mid">
          Dengan melanjutkan, Anda menyetujui untuk menggunakan data ini demi pengalaman checklist yang lebih relevan. Anda dapat memperbarui profil bisnis kapan saja melalui menu Pengaturan.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-black bg-primary px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Profil & Lanjut ke Dashboard'}
        </button>
      </footer>
    </form>
  );
}
