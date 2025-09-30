import Link from 'next/link';

const plans = [
  {
    name: 'Gratis',
    priceLabel: 'Rp0',
    period: '',
    tagline: 'Mulai eksplorasi tanpa biaya',
    features: [
      '10 pertanyaan AI per bulan',
      '3 unggahan dokumen',
      'Checklist perizinan dasar',
    ],
    ctaLabel: 'Mulai Gratis',
    ctaHref: '/auth?mode=register&plan=gratis',
    highlight: false,
  },
  {
    name: 'Satuan',
    priceLabel: 'Rp75.000',
    period: 'per izin',
    tagline: 'Bayar sesuai izin yang dibutuhkan',
    features: [
      'Q&A tanpa batas untuk izin yang dibeli',
      'Unggahan dokumen tanpa batas untuk izin tersebut',
      '1x Autopilot untuk setiap izin',
    ],
    ctaLabel: 'Upgrade ke Satuan',
    ctaHref: '/harga#satuan',
    highlight: false,
  },
  {
    name: 'Pro',
    priceLabel: 'Rp49.000',
    period: 'per bulan (tagihan tahunan)',
    tagline: 'Skalakan tim kepatuhan Anda',
    features: [
      'Q&A AI tanpa batas',
      'Unggahan dokumen tanpa batas',
      'Autopilot tanpa batas',
      'Prioritas dukungan',
    ],
    ctaLabel: 'Langganan Pro',
    ctaHref: '/harga#pro',
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-20 px-4 scroll-mt-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-neutral-dark">
            Pilih paket yang sesuai dengan kebutuhan izin Anda
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex h-full flex-col gap-6 border-2 border-neutral-light bg-white/95 p-8 shadow-card transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg ${
                plan.highlight ? 'ring-4 ring-primary/60 ring-offset-2 ring-offset-background' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-neutral-dark">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                    {plan.tagline}
                  </p>
                </div>
                {plan.highlight ? (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Terpopuler
                  </span>
                ) : null}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-neutral-dark">{plan.priceLabel}</span>
                  {plan.period ? (
                    <span className="text-sm font-medium text-neutral-mid">{plan.period}</span>
                  ) : null}
                </div>
              </div>

              <ul className="flex flex-1 list-disc flex-col gap-3 pl-5 text-base text-neutral-mid">
                {plan.features.map((feature) => (
                  <li key={feature} className="marker:text-primary">
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`inline-flex w-full items-center justify-center border-2 border-black px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-white text-neutral-dark hover:bg-secondary'
                }`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
