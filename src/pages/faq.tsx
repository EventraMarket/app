import { useState } from "react";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const faqs = [
  {
    category: "Getting Started",  
    question: "What is a prediction market?",
    answer:
      "A prediction market is a platform where you can trade on the outcome of future events. Prices reflect the crowd's belief about how likely an outcome is. If you think an outcome is undervalued, you buy shares — and profit if you're right.",
  },
  {
    category: "Getting Started",
    question: "How do I start trading?",
    answer:
      'Connect your wallet, browse the available markets, and pick one that interests you. Choose "Yes" or "No" (or another option), set your amount, and confirm the transaction. Your position is live immediately.',
  },
  {
    category: "Getting Started",
    question: "What tokens do I need?",
    answer:
      "Markets onEventra use the native bet token on Polygon Amoy testnet. You'll need testnet tokens in your wallet to place trades. Gas fees on the testnet are very low.",
  },
  {
    category: "Trading",
    question: "How are prices determined?",
    answer:
      "Odds are calculated by Azuro's liquidity pools based on supply and demand. When more people trade on a particular outcome, its odds decrease. Odds represent the potential payout multiplier (e.g., 2.50 odds means $2.50 return per $1 trade).",
  },
  {
    category: "Trading",
    question: "Can I sell my position before the market resolves?",
    answer:
      "Azuro supports a cashout feature that lets you exit your position before the event resolves. Check the cashout value and confirm to receive your funds back.",
  },
  {
    category: "Trading",
    question: "What is slippage?",
    answer:
      "Slippage is the difference between the expected odds and the odds at which your bet is actually placed. You can set a slippage tolerance (e.g., 5-10%) to ensure your bet goes through even if odds change slightly.",
  },
  {
    category: "Resolution",
    question: "How do markets get resolved?",
    answer:
      "Markets are resolved by Azuro's decentralized oracle network. When the event outcome is known, the oracle automatically settles the market and determines winning outcomes.",
  },
  {
    category: "Resolution",
    question: "How do I claim my winnings?",
    answer:
      "After a market resolves, you can redeem your winning trades. Your winnings will be sent directly to your wallet on Polygon Amoy.",
  },
  {
    category: "Platform",
    question: "Is this decentralized?",
    answer:
      "Yes. All trading, resolution, and payouts happen throughEventra smart contracts on Polygon Amoy. You sign and send transactions from your own wallet.",
  },
  {
    category: "Platform",
    question: "What isEventra?",
    answer:
      "Azuro Protocol is the decentralized prediction markets infrastructure powering this platform. It provides oracle-fed markets, liquidity pools, and smart contracts for trading, resolution, and payouts across multiple chains.",
  },
  {
    category: "Platform",
    question: "Are there fees?",
    answer:
      "A small margin is built into the odds and goes to liquidity providers. There are no hidden platform fees. Gas fees on Polygon Amoy testnet are very low.",
  },
];

const categories = Array.from(new Set(faqs.map((f) => f.category)));

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  return (
    <div className={`${geistSans.className} min-h-screen bg-[#060a14] text-white`}>
      <Navbar />

      <main className="pt-20 md:pt-24 pb-20 px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Everything you need to know about prediction markets and trading onEventra.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => { setActiveCategory("all"); setOpenIndex(null); }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-[#3b82f6] text-white"
                : "bg-[#111d3a] text-gray-400 border border-[#1e3a5f] hover:text-white"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#111d3a] text-gray-400 border border-[#1e3a5f] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`bg-[#0c1428] border rounded-xl overflow-hidden transition-colors ${
                  isOpen ? "border-[#3b82f6]/50" : "border-[#1e3a5f]"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#111d3a]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 bg-[#1e3a5f]/50 px-2 py-0.5 rounded-full">
                      {faq.category}
                    </span>
                    <span className="text-sm font-medium text-white">{faq.question}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-5 pt-0 text-gray-400 text-sm leading-relaxed border-t border-[#1e3a5f]/50">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-2xl p-10">
            <h3 className="text-xl font-bold mb-3">Still have questions?</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Join our community for support and discussions.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://discord.gg/azuro"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white text-sm font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/20"
              >
                Join Discord
              </a>
              <a
                href="https://t.me/+fAv7-KCqpis0NDI0"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 border border-gray-500 text-gray-300 text-sm font-semibold rounded-lg hover:bg-white/5 transition-colors"
              >
                Telegram
              </a>
              <a
                href="https://x.com/azuroprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 border border-gray-500 text-gray-300 text-sm font-semibold rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                
                X
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
