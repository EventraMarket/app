
// import Link from "next/link";
// import Image from "next/image";
 import { useWallet } from "@/context/WalletContext";
 import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
// import { useWallet } from "@azuro-org/sdk";

export default function TopNavbar() {
  const { address, isConnected, connecting, connect, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-2 sm:px-4 md:px-12 py-2 sm:py-3 bg-white border-b border-gray-200 shadow-sm z-50 gap-2 sm:gap-0 relative">
      {/* Logo and Hamburger */}
      <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-2xl tracking-tight text-black">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="hidden sm:inline" style={{ color: '#000' }}>Eventra</span>
        </Link>
        {/* Hamburger icon for mobile */}
        <button
          className="sm:hidden flex items-center p-2 ml-auto text-black focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Modal for mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-xs mx-auto p-6 flex flex-col items-center gap-4 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-black hover:text-yellow-600 focus:outline-none"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Link href="/markets" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2 rounded transition" onClick={() => setMenuOpen(false)}>Markets</Link>
            <Link href="/dashboard" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2 rounded transition" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link href="/create" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2 rounded transition" onClick={() => setMenuOpen(false)}>Create Market</Link>
            <Link href="/how-it-works" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2 rounded transition" onClick={() => setMenuOpen(false)}>How It Works</Link>
            <Link href="/faq" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2 rounded transition" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link href="/faucet" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2 rounded transition" onClick={() => setMenuOpen(false)}>Faucet</Link>
            <div className="w-full flex flex-col items-center gap-2 mt-2">
              {isConnected && address ? (
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded px-3 py-2 text-yellow-700 font-mono text-xs w-full justify-center">
                  <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                  <button
                    onClick={disconnect}
                    className="ml-2 text-red-500 hover:underline text-xs font-semibold"
                    title="Disconnect"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={connecting}
                  className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition text-base w-full"
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop nav links and wallet actions */}
      <div className="hidden sm:flex flex-row items-center gap-6 ml-auto">
        <Link href="/markets" className="text-black font-medium text-base hover:text-yellow-600">Markets</Link>
        <Link href="/dashboard" className="text-black font-medium text-base hover:text-yellow-600">Dashboard</Link>
        <Link href="/create" className="text-black font-bold text-base bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg transition">+ Create</Link>
        <Link href="/how-it-works" className="text-black font-medium text-base hover:text-yellow-600">How It Works</Link>
        <Link href="/faq" className="text-black font-medium text-base hover:text-yellow-600">FAQ</Link>
        <Link href="/faucet" className="text-black font-medium text-base hover:text-yellow-600">Faucet</Link>
        <div className="flex items-center gap-3 justify-end">
          {isConnected && address ? (
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded px-3 py-1.5 text-yellow-700 font-mono text-xs">
              <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
              <button
                onClick={disconnect}
                className="ml-2 text-red-500 hover:underline text-xs font-semibold"
                title="Disconnect"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="bg-yellow-400 text-black px-4 py-1.5 rounded font-semibold hover:bg-yellow-500 transition text-base"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
