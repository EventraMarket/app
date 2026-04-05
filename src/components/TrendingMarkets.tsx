import MarketCard from "./MarketCard";
import { useGames } from "@azuro-org/sdk";

export default function TrendingMarkets() {
  const { data, isFetching } = useGames({ perPage: 3 });

  const games = data?.games ?? [];

  return (
    <section className="relative py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <h2 className="text-center text-white text-xl md:text-2xl font-bold tracking-widest mb-8 md:mb-12">
          TRENDING MARKETS
        </h2>

        {/* Loading skeleton */}
        {isFetching && games.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#111d3a] border border-[#1e3a5f] rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-[#1e3a5f] rounded w-24 mb-4" />
                <div className="h-5 bg-[#1e3a5f] rounded w-full mb-2" />
                <div className="h-5 bg-[#1e3a5f] rounded w-3/4 mb-6" />
                <div className="flex gap-3 mb-6">
                  <div className="h-10 bg-[#1e3a5f] rounded flex-1" />
                  <div className="h-10 bg-[#1e3a5f] rounded flex-1" />
                </div>
                <div className="h-10 bg-[#1e3a5f] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Market cards grid */}
        {games.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {games.map((game) => (
              <MarketCard key={game.gameId} game={game} />
            ))}
          </div>
        )}

        {!isFetching && games.length === 0 && (
          <p className="text-center text-gray-500">
            No markets available yet. Check back soon!
          </p>
        )}
      </div>
    </section>
  );
}
