

import { useState } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function TopNavbar() {
  const { isConnected, connecting, connect, disconnect, isMiniPay } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-2 sm:px-4 md:px-12 py-2 sm:py-3 bg-white border-b border-gray-200 shadow-sm z-50 gap-2 sm:gap-0 relative">
      {/* Logo and Hamburger */}
      <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-2xl tracking-tight text-black">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="hidden sm:inline" style={{ color: '#000' }}>Eventra</span>
        </Link>
        <button
          className="sm:hidden flex items-center p-2 ml-auto text-black focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16" />
          </svg>
        </button>
      </div>

      {/* Modal for mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-xs mx-auto p-6 flex flex-col items-center gap-4 relative">
            <button
              className="absolute top-3 right-3 text-black hover:text-yellow-600 focus:outline-none"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Link href="/markets" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>Markets</Link>
            <Link href="/dashboard" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link href="/create" className="text-black font-medium text-lg hover:text-yellow-600 w-full text-center py-2" onClick={() => setMenuOpen(false)}>Create Market</Link>
            <div className="w-full flex flex-col items-center gap-2 mt-2">
              {!isMiniPay && <ConnectButton accountStatus="full" chainStatus="icon" showBalance={false} />}
            </div>
          </div>
        </div>
      )}

      {/* Desktop nav links and wallet actions */}
      <div className="hidden sm:flex flex-row items-center gap-6 ml-auto">
        <Link href="/markets" className="text-black font-medium text-base hover:text-yellow-600">Markets</Link>
        <Link href="/dashboard" className="text-black font-medium text-base hover:text-yellow-600">Dashboard</Link>
        <Link href="/create" className="text-black font-bold text-base bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg transition">+ Create</Link>
        <div className="flex items-center gap-3 justify-end">
          {/* Automatically handles connection details, balance info, and chain switcher drop-downs */}
          {!isMiniPay && <ConnectButton accountStatus="full" chainStatus="name" showBalance={false} />}
        </div>
      </div>
    </nav>
  );
}