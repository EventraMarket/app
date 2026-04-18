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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-card)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-4 md:px-12 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-[var(--color-accent2)] tracking-tight"
          >
            <Image src="/logo-predict.png" alt="Logo" width={32} height={32} />
            <span className="hidden sm:inline">Predict Market</span>
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
          </div>

          {/* Connect Wallet button */}
          <div className="flex items-center gap-3">
            {isConnected && address ? (
              <div className="flex items-center gap-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-1.5 text-[var(--color-accent2)] font-mono text-xs">
                <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                <button
                  onClick={disconnect}
                  className="ml-2 text-[var(--color-danger)] hover:underline text-xs font-semibold"
                  title="Disconnect"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="btn"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Tabs below navbar */}
      <div className="sticky top-[64px] z-40 bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center px-2 md:px-12 overflow-x-auto min-h-[56px] shadow-sm">
        <div className="flex gap-2 md:gap-4 w-full py-2">
          <Link href="/markets" className="group relative px-4 py-1.5 rounded-full font-semibold text-sm text-white">
            <span className="relative z-10">Markets</span>
            <span className="absolute inset-0 rounded-full bg-[var(--color-accent2)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-1" />
          </Link>
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
    </>
  );
}
// ...existing code...
// All wallet, connect, disconnect, and mobile menu code removed for predict.fun style
// Only keep the new navbar code above
