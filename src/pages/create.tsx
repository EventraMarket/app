import { Geist } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function CreateMarketPage() {
  return (
    <div className={`${geistSans.className} min-h-screen bg-[#060a14] text-white`}>
      <Navbar />

      <main className="pt-20 md:pt-24 pb-16 px-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/markets" className="hover:text-[#3b82f6] transition-colors">
              Markets
            </Link>
            <span>/</span>
            <span className="text-gray-300">About Markets</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Azuro Protocol Markets</h1>
          <p className="text-gray-400">
            Prediction markets on Azuro are created by trusted oracle providers, ensuring
            fair and accurate event resolution.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-8 mb-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#3b82f6]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-center mb-4">Oracle-Powered Markets</h2>
          <p className="text-gray-400 text-sm text-center max-w-lg mx-auto mb-8">
            Unlike traditional prediction market platforms, Azuro Protocol markets are created and
            resolved by decentralized oracle providers. This ensures accurate outcomes and fair pricing
            for all participants.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111d3a] border border-[#1e3a5f] rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-sm font-semibold mb-1">Sports Events</p>
              <p className="text-xs text-gray-500">Football, basketball, tennis, and more</p>
            </div>
            <div className="bg-[#111d3a] border border-[#1e3a5f] rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-semibold mb-1">Fair Odds</p>
              <p className="text-xs text-gray-500">Oracle-calculated pricing with real-time updates</p>
            </div>
            <div className="bg-[#111d3a] border border-[#1e3a5f] rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-sm font-semibold mb-1">Trustless Resolution</p>
              <p className="text-xs text-gray-500">Automated on-chain settlement</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/markets"
              className="inline-flex px-8 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/25"
            >
              Browse Markets
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-8">
          <h2 className="text-lg font-bold mb-6">How Trading Works</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "Browse Events", desc: "Find upcoming sports events and prediction markets" },
              { step: 2, title: "Connect Wallet", desc: "Connect your MetaMask or compatible wallet on Polygon Amoy testnet" },
              { step: 3, title: "Select Outcome", desc: "Choose the outcome you want to trade on and see live odds" },
              { step: 4, title: "Place Your Trade", desc: "Enter your trade amount and confirm the transaction" },
              { step: 5, title: "Collect Winnings", desc: "If your prediction is correct, redeem your winnings on-chain" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#3b82f6]">{item.step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
