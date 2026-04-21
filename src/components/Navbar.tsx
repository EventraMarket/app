import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";

export default function Navbar() {
  const { address, isConnected, connecting, connect, disconnect } = useWallet();
  const navLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/faq", label: "FAQ" },
    { href: "/faucet", label: "Faucet" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] shadow-lg"
        style={{
          background: 'linear-gradient(90deg, #F3B21A 0%, #DED5A8 25%, #D9A650 60%, #F3B21A 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 24px 0 rgba(243,178,26,0.10), 0 1.5px 0 0 #D9A650 inset'
        }}
      >
        <div className="flex items-center justify-between px-4 md:px-12 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
          >
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="hidden sm:inline" style={{ color: '#000' }}>Eventra</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--color-foreground)] hover:text-[var(--color-accent)] text-base font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/trending" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-white">
              <span className="relative z-10">Trending</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-accent2)]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/new" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-white">
              <span className="relative z-10">New</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-accent2)]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/sports" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-white">
              <span className="relative z-10">Sports</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-accent2)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/politics" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-[var(--color-foreground)]">
              <span className="relative z-10">Politics</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/crypto" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-[var(--color-foreground)]">
              <span className="relative z-10">Crypto</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/esports" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-[var(--color-foreground)]">
              <span className="relative z-10">Esports</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/finance" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-[var(--color-foreground)]">
              <span className="relative z-10">Finance</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/economy" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-[var(--color-foreground)]">
              <span className="relative z-10">Economy</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/culture" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-[var(--color-foreground)]">
              <span className="relative z-10">Culture</span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
            <Link href="/more" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-[var(--color-foreground)]">
              <span className="relative z-10">More <span className='ml-1'>▼</span></span>
              <span className="absolute inset-0 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
            </Link>
        </div>

          </div>
          </nav>
    </>
  );
  
  }   