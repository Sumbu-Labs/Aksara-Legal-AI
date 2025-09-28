import Link from 'next/link';

export function Navbar() {
  return (
  <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-[var(--background)]">
  <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4">
        <Link href="/" className="text-2xl font-heading tracking-wider uppercase">
          Aksara
        </Link>

        <nav className="hidden md:flex gap-8 items-center text-sm">
          <Link href="#features" className="hover:underline">Features</Link>
          <Link href="#how" className="hover:underline">How it works</Link>
          <Link href="#pricing" className="hover:underline">Pricing</Link>
          <Link href="#contact" className="hover:underline">Contact</Link>
        </nav>

        <div className="ml-4">
          <Link href="#get-started" className="bg-primary text-[var(--background)] px-4 py-2 rounded-sm border-2 border-black font-medium">Get started</Link>
        </div>
      </div>
    </header>
  );
}
