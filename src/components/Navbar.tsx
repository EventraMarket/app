import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";

export default function Navbar() {
  const { address, isConnected, connecting, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const navLinks = [
    { href: "/markets", label: "Markets" },
    { href: "/my-bets", label: "My Bets" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/faq", label: "FAQ" },
    { href: "/faucet", label: "Faucet" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#3b82f6] font-semibold text-sm flex-shrink-0"
        >
          <Image src="/logo-predict.png" alt="Logo" width={28} height={28} /> Home
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/create"
            className="px-4 py-1.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-md text-sm font-semibold hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/20"
          >
            About
          </Link>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div
                onClick={copyAddress}
                title={address}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#111d3a] border border-[#1e3a5f] rounded-md cursor-pointer hover:bg-[#162a4a] transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-300 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <span className="text-[10px] text-gray-500">
                  {copied ? "\u2713" : "\ud83d\udccb"}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="px-3 py-1.5 border border-red-500/40 text-red-400 rounded-md text-sm hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="px-4 py-1.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-md text-sm font-semibold hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>

        {/* Mobile: wallet + hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {isConnected ? (
            <div
              onClick={copyAddress}
              className="flex items-center gap-1 px-2 py-1 bg-[#111d3a] border border-[#1e3a5f] rounded-md cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] text-gray-300 font-mono">
                {address?.slice(0, 4)}...{address?.slice(-3)}
              </span>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="px-3 py-1.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-md text-xs font-semibold disabled:opacity-50"
            >
              {connecting ? "..." : "Connect"}
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0a0e1a]/95 backdrop-blur-md">
          <div className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-white text-sm py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/create"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-white text-sm py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              About
            </Link>

            <div className="border-t border-white/5 mt-2 pt-3">
              {isConnected ? (
                <button
                  onClick={() => { disconnect(); setMenuOpen(false); }}
                  className="w-full py-2.5 border border-red-500/40 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
                >
                  Disconnect Wallet
                </button>
              ) : (
                <button
                  onClick={() => { connect(); setMenuOpen(false); }}
                  disabled={connecting}
                  className="w-full py-2.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
