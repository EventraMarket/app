import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "sigin",
    description: "Link your MetaMask or any EVM-compatible wallet to get started on Polygon Amoy testnet.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Browse Markets",
    description: "Explore live sports and esports events with real-time odds powered by Eventra.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Place a Trade",
    description: "Pick your outcome, set your amount, and confirm. Odds are determined by on-chain liquidity pools.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Collect Winnings",
    description: "When the event resolves, claim your payout directly to your wallet — fully on-chain.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorksPreview() {
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-xl md:text-2xl font-bold tracking-widest mb-3">HOW IT WORKS</h2>
        <p className="text-center text-[#D9A650] mb-8 md:mb-14 max-w-lg mx-auto text-sm md:text-base">
          Four simple steps to start trading on prediction markets
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-black border border-[#D9A650]/50 rounded-xl p-6 hover:border-[#F3B21A]/40 transition-colors group"
            >
              <div className="absolute -top-3 -left-2 text-[#F3B21A]/20 text-5xl font-black select-none">
                {step.number}
              </div>
              <div className="text-[#F3B21A] mb-4 mt-2">{step.icon}</div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-[#D9A650] text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/how-it-works"
            className="text-[#F3B21A] hover:text-[#D9A650] text-sm font-medium transition-colors"
          >
            Read the full guide &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
