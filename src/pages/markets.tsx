import { useState } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useGames } from "@azuro-org/sdk";
import { formatDate } from "@/lib/rain";

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

        {/* Table */}
        <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e3a5f] text-left">
                  <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</th>
                  <th className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sport</th>
                  <th className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">League</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Starts At</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isFetching && games.length === 0 && (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-[#1e3a5f]/50 animate-pulse">
                        <td className="px-6 py-5"><div className="h-4 w-6 bg-[#1e3a5f] rounded" /></td>
                        <td className="px-6 py-5"><div className="h-4 w-64 bg-[#1e3a5f] rounded" /></td>
                        <td className="px-6 py-5"><div className="h-4 w-20 bg-[#1e3a5f] rounded" /></td>
                        <td className="px-6 py-5"><div className="h-4 w-20 bg-[#1e3a5f] rounded" /></td>
                        <td className="px-6 py-5"><div className="h-5 w-20 bg-[#1e3a5f] rounded" /></td>
                        <td className="px-6 py-5"><div className="h-4 w-32 bg-[#1e3a5f] rounded" /></td>
                        <td className="px-6 py-5"><div className="h-8 w-20 bg-[#1e3a5f] rounded ml-auto" /></td>
                      </tr>
                    ))}
                  </>
                )}
                {!isFetching && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                      No markets found matching your criteria.
                    </td>
                  </tr>
                )}
                {filtered.map((game, idx) => {
                  const isLive = Number(game.startsAt) * 1000 < Date.now();
                  const title = game.title || game.participants.map((p) => p.name).join(" vs ");

                  return (
                    <tr
                      key={game.gameId}
                      className="border-b border-[#1e3a5f]/50 hover:bg-[#111d3a]/60 transition-colors group"
                    >
                      <td className="px-3 md:px-6 py-4 md:py-5 text-sm text-gray-500">{(page - 1) * 20 + idx + 1}</td>
                      <td className="px-3 md:px-6 py-4 md:py-5">
                        <Link href={`/market/${game.gameId}`} className="text-sm font-medium text-white group-hover:text-[#3b82f6] transition-colors">
                          {title}
                        </Link>
                      </td>
                      <td className="hidden sm:table-cell px-3 md:px-6 py-4 md:py-5">
                        <span className="text-sm text-gray-300">{game.sport?.name}</span>
                      </td>
                      <td className="hidden md:table-cell px-3 md:px-6 py-4 md:py-5">
                        <span className="text-sm text-gray-400">{game.league?.name}</span>
                      </td>
                      <td className="px-3 md:px-6 py-4 md:py-5">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[10px] font-semibold rounded-full border ${
                            isLive
                              ? "text-green-400 border-green-400/30 bg-green-400/10"
                              : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                          }`}
                        >
                          {isLive ? "Live" : "Upcoming"}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 md:px-6 py-4 md:py-5">
                        <span className="text-sm text-gray-300">
                          {formatDate(Number(game.startsAt))}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 md:py-5 text-right">
                        <Link
                          href={`/market/${game.gameId}`}
                          className="px-4 py-2 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white text-xs font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/20 inline-block"
                        >
                          Trade
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
}
