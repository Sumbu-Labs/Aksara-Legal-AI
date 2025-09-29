import Image from 'next/image';

const partners = [
  {
    name: 'GIK UGM',
    logoSrc: '/partners/gik.png',
    width: 180,
    height: 87,
  },
  {
    name: 'UGM',
    logoSrc: '/partners/gadjah-mada.png',
    width: 80,
    height: 80,
  },
  {
    name: 'DTETI UGM',
    logoSrc: '/partners/dteti.png',
    width: 225,
    height: 225,
  },
  {
    name: 'DIKE UGM',
    logoSrc: '/partners/dike-ugm.png',
    width: 225,
    height: 225,
  },
];

export function PartnersSection() {
  return (
    <section className="bg-secondary/30 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-neutral-mid">
          Dipercayai oleh
        </p>
        <div className="mt-8 overflow-hidden">
          <div className="partner-marquee">
            {[0, 1].map((index) => (
              <ul
                key={index}
                className="partner-track"
                aria-hidden={index === 1}
              >
                {partners.map((partner) => (
                  <li
                    key={`${partner.name}-${index}`}
                    className="flex h-24 w-48 shrink-0 items-center justify-center rounded-2xl border border-neutral-light bg-white/90 p-4 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg"
                  >
                    <Image
                      src={partner.logoSrc}
                      alt={partner.name}
                      width={partner.width}
                      height={partner.height}
                      className="h-12 w-auto object-contain"
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
