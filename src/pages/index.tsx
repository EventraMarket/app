import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"] });

const STATS = [
  { value: "44+", label: "Active Markets" },
  { value: "$14K+", label: "Total Volume" },
  { value: "290+", label: "Active Users" },
  { value: "4000+", label: "Transactions" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse Markets",
    desc: "Explore prediction markets across sports, crypto, politics, culture and more — all live on Base Sepolia.",
  },
  {
    step: "02",
    title: "Pick Your Position",
    desc: "Choose Yes or No (or team A vs B) and allocate mock USDC to your prediction.",
  },
  {
    step: "03",
    title: "Trade & Win",
    desc: "Markets resolve on-chain. Winning positions pay out automatically — no middlemen, no delays.",
  },
];

const CATEGORIES = [
  { label: "Politics", emoji: "🗳️" },
  { label: "Sports", emoji: "⚽" },
  { label: "Crypto", emoji: "₿" },
  { label: "Finance", emoji: "📈" },
  { label: "Culture", emoji: "🎬" },
  { label: "Esports", emoji: "🎮" },
  { label: "Economy", emoji: "🌐" },
  { label: "Other", emoji: "✨" },
];

export default function LandingPage() {
  const { isConnected, connecting, connect, address } = useWallet();

  return (
    <div className={`${geist.className} min-h-screen bg-[#F3B21A] text-black overflow-x-hidden`}>
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-16 py-4"
        style={{ background: "linear-gradient(90deg,#F3B21A 0%,#DED5A8 50%,#F3B21A 100%)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-black">
          <Image src="/logo.png" alt="Eventra" width={32} height={32} />
          <span>Eventra</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/markets" className="hover:opacity-70 transition-opacity">Markets</Link>
          <Link href="/how-it-works" className="hover:opacity-70 transition-opacity">How It Works</Link>
          {/* <Link href="/faucet" className="hover:opacity-70 transition-opacity">Faucet</Link> */}
          <Link href="/faq" className="hover:opacity-70 transition-opacity">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <Link href="/dashboard"
              className="px-4 py-2 bg-black text-[#F3B21A] text-sm font-bold rounded-full hover:brightness-110 transition">
              Dashboard
            </Link>
          ) : (
            <button onClick={connect} disabled={connecting}
              className="px-4 py-2 bg-black text-[#F3B21A] text-sm font-bold rounded-full hover:brightness-110 transition disabled:opacity-50">
              {connecting ? "Connecting…" : "Signin"}
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 md:px-16 flex flex-col items-center text-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-black/5 rounded-full blur-3xl pointer-events-none" />

        <span className="inline-block mb-4 px-4 py-1.5 bg-black text-[#F3B21A] text-xs font-bold rounded-full uppercase tracking-widest shadow">
          Built on Celo Network
        </span>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight max-w-4xl mb-6 text-black">
          Predict the Future,{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Earn on Truth</span>
            <span className="absolute inset-x-0 bottom-1 h-4 bg-black/10 rounded-sm -z-0" />
          </span>
        </h1>

        <p className="text-black/60 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
          Eventra is a decentralised prediction market platform. Trade outcome tokens on real-world events — sports, crypto, politics and more — powered by on-chain settlement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* <Link href="/markets"
            className="px-8 py-4 bg-black text-[#F3B21A] text-base font-bold rounded-2xl shadow-xl hover:brightness-110 hover:scale-105 transition-all duration-200">
            Browse Markets →
          </Link> */}
          {/* <div className="flex flex-col sm:flex-row gap-4 items-center justify-center"> */}
      {isConnected ? (
        <Link 
          href="/markets"
          className="px-8 py-4 bg-black text-[#F3B21A] text-base font-bold rounded-2xl shadow-xl hover:brightness-110 hover:scale-105 transition-all duration-200"
        >
          Browse Markets
        </Link>
      ) : (
        <button 
          onClick={connect}
          disabled={connecting}
          className="px-8 py-4 bg-black text-[#F3B21A] text-base font-bold rounded-2xl shadow-xl hover:brightness-110 hover:scale-105 transition-all duration-200"
        >
          {connecting ? "Signing..." : " Browse Markets"}
        </button>
      )}
          <Link href="/how-it-works"
            className="px-8 py-4 bg-black/10 text-black text-base font-semibold rounded-2xl border border-black/20 hover:bg-black/20 transition-all duration-200">
            How It Works
          </Link>
        </div>

        {/* Hero image / mockup */}
        <div className="mt-16 w-full max-w-4xl mx-auto">
          <div className="bg-black rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-white/30 font-mono">eventra / markets</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { q: "Will Bitcoin hit $120K by June 2026?", cat: "Crypto", yes: "62¢", no: "38¢" },
                { q: "Will Lionel Messi retire in 2026?", cat: "Sports", yes: "45¢", no: "55¢" },
                { q: "Will the Fed cut rates in Q3 2026?", cat: "Finance", yes: "71¢", no: "29¢" },
              ].map((m) => (
                <div key={m.q} className="bg-[#111] border border-[#D9A650]/20 rounded-2xl p-4 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-[#F3B21A]/70 font-medium">{m.cat}</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">● Live</span>
                  </div>
                  <p className="text-white text-sm font-semibold mb-4 leading-snug">{m.q}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-green-600/80 text-white text-xs font-bold rounded-lg">Yes {m.yes}</button>
                    <button className="flex-1 py-1.5 bg-red-700/80 text-white text-xs font-bold rounded-lg">No {m.no}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="bg-black rounded-2xl p-6 text-center shadow-lg">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#F3B21A]">{s.value}</p>
              <p className="text-white/60 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black text-center mb-3">Trade on Every Category</h2>
          <p className="text-black/60 text-center mb-10">From geopolitics to gaming — markets for everything you care about.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((c) => (
              <Link key={c.label} href={`/markets?category=${c.label}`}
                className="bg-black rounded-2xl p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform shadow-lg group">
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-white font-semibold text-sm group-hover:text-[#F3B21A] transition-colors">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black text-center mb-3">How It Works</h2>
          <p className="text-black/60 text-center mb-12">Get started in three simple steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.step} className="bg-black rounded-3xl p-8 shadow-xl">
                <span className="text-5xl font-extrabold text-[#F3B21A]/30">{h.step}</span>
                <h3 className="text-white text-lg font-bold mt-3 mb-2">{h.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6 md:px-16">
        <div className="max-w-3xl mx-auto bg-black rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to make your prediction?
          </h2>
          <p className="text-white/50 mb-8 text-base">
            No real money. Just on-chain logic, real outcomes, and bragging rights.
            Claim test USDC from the faucet and start trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/markets"
              className="px-8 py-4 bg-[#F3B21A] text-black text-base font-extrabold rounded-2xl hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-lg">
              Browse All Markets →
            </Link>
            <Link href="/faucet"
              className="px-8 py-4 bg-white/10 text-white text-base font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-200">
              Get Test USDC
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 md:px-16 border-t border-black/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-black">
            <Image src="/logo.png" alt="Eventra" width={24} height={24} />
            <span>Eventra</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-black/60">
            <Link href="/markets" className="hover:text-black transition-colors">Markets</Link>
            <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
            <Link href="/faucet" className="hover:text-black transition-colors">Faucet</Link>
            <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
          </div>
          <p className="text-xs text-black/40">© 2026 Eventra · Base Sepolia Testnet</p>
        </div>
      </footer>
    </div>
  );
}

