import MarketCard from "./MarketCard";
import { useMarkets } from "@/lib/useMarkets";

export default function TrendingMarkets() {
  const { data, isFetching } = useMarkets(1, 3);

  const games = data?.games ?? [];

  return (
    <section className="relative py-14 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <h2 className="text-center text-[var(--color-accent2)] text-2xl md:text-3xl font-extrabold tracking-tight mb-10 md:mb-14 uppercase drop-shadow-lg">
          Trending Markets
        </h2>

        {/* Loading spinner */}
        {isFetching && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#F3B21A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Market cards grid */}
        {!isFetching && games.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {games.map((game) => (
              <MarketCard key={game.gameId} game={game} />
            ))}
          </div>
        )}

        {!isFetching && games.length === 0 && (
          <p className="text-center text-muted text-lg">
            No markets available yet. Check back soon!
          </p>
        )}
      </div>
    </section>
  );
}
