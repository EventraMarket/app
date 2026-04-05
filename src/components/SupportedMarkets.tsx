import Link from "next/link";

/* Detailed sport SVG icons */
function FootballIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#1a1a2e" stroke="#3b82f6" strokeWidth="2" />
      <path d="M32 4a28 28 0 100 56 28 28 0 000-56z" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
      <polygon points="32,18 38,24 36,32 28,32 26,24" fill="#3b82f6" opacity="0.7" />
      <line x1="32" y1="18" x2="32" y2="8" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
      <line x1="38" y1="24" x2="48" y2="18" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
      <line x1="36" y1="32" x2="46" y2="38" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
      <line x1="28" y1="32" x2="18" y2="38" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
      <line x1="26" y1="24" x2="16" y2="18" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="2" />
      <line x1="4" y1="32" x2="60" y2="32" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function BasketballIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#1a1a2e" stroke="#f97316" strokeWidth="2" />
      <line x1="4" y1="32" x2="60" y2="32" stroke="#f97316" strokeWidth="1.5" />
      <line x1="32" y1="4" x2="32" y2="60" stroke="#f97316" strokeWidth="1.5" />
      <path d="M12 8 Q32 32 12 56" fill="none" stroke="#f97316" strokeWidth="1.5" />
      <path d="M52 8 Q32 32 52 56" fill="none" stroke="#f97316" strokeWidth="1.5" />
    </svg>
  );
}

function TennisIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#1a1a2e" stroke="#22c55e" strokeWidth="2" />
      <path d="M10 12 Q32 32 10 52" fill="none" stroke="#22c55e" strokeWidth="2" />
      <path d="M54 12 Q32 32 54 52" fill="none" stroke="#22c55e" strokeWidth="2" />
    </svg>
  );
}

function MMAIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 44 L16 28 Q14 20 20 16 L28 14 Q32 13 36 14 L44 16 Q50 20 48 28 L44 44" stroke="#ef4444" strokeWidth="2" fill="#1a1a2e" strokeLinecap="round" />
      <path d="M20 44 Q22 50 26 52 L24 58" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M44 44 Q42 50 38 52 L40 58" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M26 52 L38 52" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="32" x2="40" y2="32" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
      <line x1="22" y1="36" x2="42" y2="36" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function CricketIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="29" y="8" width="6" height="36" rx="3" fill="#1a1a2e" stroke="#eab308" strokeWidth="2" />
      <rect x="26" y="40" width="12" height="4" rx="1" fill="#1a1a2e" stroke="#eab308" strokeWidth="1.5" />
      <line x1="32" y1="44" x2="32" y2="56" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="56" x2="36" y2="56" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="16" r="6" fill="#1a1a2e" stroke="#eab308" strokeWidth="2" />
      <path d="M44 12 L52 20" stroke="#eab308" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function CS2Icon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" fill="#1a1a2e" stroke="#a855f7" strokeWidth="2" />
      <circle cx="32" cy="32" r="12" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="4" fill="none" stroke="#a855f7" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="1.5" fill="#a855f7" />
      <line x1="32" y1="12" x2="32" y2="20" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="44" x2="32" y2="52" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="32" x2="20" y2="32" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
      <line x1="44" y1="32" x2="52" y2="32" stroke="#a855f7" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function DotaIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="40" height="40" rx="4" fill="#1a1a2e" stroke="#ec4899" strokeWidth="2" />
      <path d="M16 52 L48 12" stroke="#ec4899" strokeWidth="2" opacity="0.4" />
      <circle cx="26" cy="38" r="8" fill="none" stroke="#ec4899" strokeWidth="2" />
      <path d="M38 18 L46 18 L46 26" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="38" r="2" fill="#ec4899" />
      <circle cx="42" cy="22" r="2" fill="#ec4899" />
    </svg>
  );
}

function LoLIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 L52 20 L52 44 L32 56 L12 44 L12 20 Z" fill="#1a1a2e" stroke="#06b6d4" strokeWidth="2" />
      <path d="M32 16 L44 24 L44 40 L32 48 L20 40 L20 24 Z" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
      <path d="M32 24 L36 28 L36 36 L32 40 L28 36 L28 28 Z" fill="#06b6d4" opacity="0.3" stroke="#06b6d4" strokeWidth="1" />
      <circle cx="32" cy="32" r="3" fill="#06b6d4" />
    </svg>
  );
}

const sports = [
  { name: "Football", icon: <FootballIcon />, markets: "200+", color: "border-blue-500/30 hover:border-blue-500/60" },
  { name: "Basketball", icon: <BasketballIcon />, markets: "150+", color: "border-orange-500/30 hover:border-orange-500/60" },
  { name: "Tennis", icon: <TennisIcon />, markets: "120+", color: "border-green-500/30 hover:border-green-500/60" },
  { name: "MMA / UFC", icon: <MMAIcon />, markets: "50+", color: "border-red-500/30 hover:border-red-500/60" },
  { name: "Cricket", icon: <CricketIcon />, markets: "80+", color: "border-yellow-500/30 hover:border-yellow-500/60" },
  { name: "CS2", icon: <CS2Icon />, markets: "60+", color: "border-purple-500/30 hover:border-purple-500/60" },
  { name: "Dota 2", icon: <DotaIcon />, markets: "40+", color: "border-pink-500/30 hover:border-pink-500/60" },
  { name: "LoL", icon: <LoLIcon />, markets: "40+", color: "border-cyan-500/30 hover:border-cyan-500/60" },
];

export default function SupportedMarkets() {
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-xl md:text-2xl font-bold tracking-widest mb-3">SUPPORTED MARKETS</h2>
        <p className="text-center text-gray-400 mb-8 md:mb-14 max-w-lg mx-auto text-sm md:text-base">
          Trade on hundreds of events across sports and esports — all powered by Azuro&apos;s decentralized oracle network
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {sports.map((sport) => (
            <div
              key={sport.name}
              className={`bg-[#0c1428] border ${sport.color} rounded-xl p-4 md:p-6 text-center transition-all group cursor-default`}
            >
              <div className="flex justify-center mb-3">{sport.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{sport.name}</h3>
              <p className="text-xs text-gray-500">{sport.markets} events</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/markets"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/25"
          >
            Explore All Markets
          </Link>
        </div>
      </div>
    </section>
  );
}
