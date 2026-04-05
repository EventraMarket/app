import { Geist } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const steps = [
  {
    number: "01",
    title: "Browse Markets",
    description:
      "Explore a wide range of prediction markets on sports events — from football to basketball, tennis, and more. Every market is powered by Azuro Protocol on Polygon Amoy testnet.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Place Your Trade",
    description:
      'Pick an outcome and place your trade at the current odds. If your prediction is correct, you win based on the odds at the time of your trade.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Trade & Monitor",
    description:
      "Markets are live — odds move with demand. Watch real-time odds updates as trades flow in. Track your active trades and potential returns.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Claim Winnings",
    description:
      "When the event resolves, winning trades pay out. Redeem your winnings directly to your wallet — no intermediaries, no delays. Everything is settled on-chain via Azuro Protocol.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "On-Chain & Transparent",
    description: "All markets run on Polygon Amoy smart contracts via Azuro Protocol. Every trade, resolution, and payout is publicly verifiable.",
  },
  {
    title: "Gasless Trading",
    description: "Low gas fees on Polygon Amoy testnet make trading affordable. Connect your MetaMask wallet and start trading instantly.",
  },
  {
    title: "AMM-Powered Pricing",
    description: "Odds are determined by Azuro's liquidity pools. The more demand for an outcome, the lower the odds become.",
  },
  {
    title: "Real-Time Data",
    description: "WebSocket streams deliver live price updates. Watch markets move in real-time as trades happen.",
  },
  {
    title: "Flexible Options",
    description: "Markets support multiple outcomes per event — match winner, over/under, handicaps, and more.",
  },
  {
    title: "Built for Everyone",
    description: "Whether you're a seasoned trader or a first-time user, the platform is designed to be intuitive and accessible.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className={`${geistSans.className} min-h-screen bg-[#060a14] text-white`}>
      <Navbar />

      <main className="pt-20 md:pt-24 pb-20 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Prediction markets let you trade on the outcome of future events. Here&apos;s how to get started in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#3b82f6] via-[#1e3a5f] to-transparent hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex items-start gap-8 group">
                {/* Step number circle */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#1e40af] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <span className="text-white font-bold text-sm">{step.number}</span>
                </div>

                {/* Content card */}
                <div className="flex-1 bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-6 hover:border-[#3b82f6]/40 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-[#3b82f6]">{step.icon}</div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>

                {/* Connector dot */}
                {i < steps.length - 1 && (
                  <div className="absolute left-8 -bottom-6 w-px h-12 bg-[#1e3a5f] hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center mb-12 tracking-wide">WHY PREDICTION MARKETS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-6 hover:border-[#3b82f6]/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/20 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-[#111d3a] to-[#0c1428] border border-[#1e3a5f] rounded-2xl p-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join thousands of traders making predictions on the world&apos;s biggest events.
            </p>
            <Link href="/markets" className="inline-block px-10 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/25">
              Start Trading Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
