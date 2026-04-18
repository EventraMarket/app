import { useState } from "react";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
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
    <div className={`${geistSans.className} min-h-screen bg-[#060a14] text-white`}>
      <Navbar />
      <main className="pt-20 md:pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">All Markets</h1>
          <p className="text-gray-400">Browse and trade on prediction markets powered by Azuro Protocol</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full md:max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111d3a] border border-[#1e3a5f] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "upcoming", "live"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#111d3a] text-gray-400 border border-[#1e3a5f] hover:text-white"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {isFetching && games.length === 0 &&
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="card animate-pulse p-6 h-56" />
            ))}
          {!isFetching && filtered.length === 0 && (
            <div className="col-span-full text-center text-muted py-16">
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
          Powered by Azuro Protocol on Polygon Amoy Testnet
        </div>
      </main>
    </div>
  );

// ...existing code...
}
