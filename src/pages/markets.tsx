import { useState } from "react";
import { Geist } from "next/font/google";
import TopNavbar from "@/components/TopNavbar";
import CategoryNavbar from "@/components/CategoryNavbar";
import BannerSection from "@/components/BannerSection";
import { useGames } from "@azuro-org/sdk";
import MarketCard from "@/components/MarketCard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

type StatusFilter = "all" | "upcoming" | "live";

export default function MarketsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const { data, isFetching } = useGames({
    perPage: 20,
    page,
    isLive: statusFilter === "live" ? true : undefined,
  });

  const games = data?.games ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = games.filter((g) => {
    const title = g.title || g.participants.map((p) => p.name).join(" vs ");
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === "upcoming") {
      return matchesSearch && Number(g.startsAt) * 1000 > Date.now();
    }
    return matchesSearch;
  });

  return (
    <div className={`${geistSans.className} min-h-screen text-white`}>
      <TopNavbar />
      <CategoryNavbar />
      <BannerSection />

      <main className="pt-6 md:pt-12 pb-20 px-2 sm:px-4 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-4 md:mb-8 px-1 sm:px-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">All Markets</h1>
          <p className="text-gray-400 text-sm sm:text-base">Browse and trade on prediction markets on Eventra</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6 w-full">
          <div className="relative flex-1 w-full sm:max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-yellow-300 rounded-lg text-sm text-white placeholder-yellow-200 focus:outline-none focus:border-yellow-500 transition-colors shadow-sm"
              style={{ minWidth: 0 }}
            />
          </div>
          <div className="flex flex-row flex-wrap items-center gap-2 w-full sm:w-auto">
            {(["all", "upcoming", "live"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-[70px] sm:min-w-[80px] focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  statusFilter === s
                    ? "bg-yellow-400 text-black shadow"
                    : "bg-black/80 text-yellow-200 border border-yellow-300 hover:text-white hover:bg-yellow-500/20"
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
          {isFetching && games.length === 0 &&
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="card animate-pulse h-44 sm:h-56" />
            ))}
          {!isFetching && filtered.length === 0 && (
            <div className="col-span-full text-center text-muted py-12 sm:py-16">
              No markets found matching your criteria.
            </div>
          )}
          {filtered.map((game) => (
            <MarketCard key={game.gameId} game={game} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Page {page} of {totalPages} ({data?.total ?? 0} events)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-[#111d3a] border border-[#1e3a5f] rounded text-gray-400 hover:text-white disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-[#111d3a] border border-[#1e3a5f] rounded text-gray-400 hover:text-white disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-2 text-right text-xs text-gray-600">
          Eventra on Polygon Amoy Testnet
        </div>
      </main>
    </div>
  );


}
