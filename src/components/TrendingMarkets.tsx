import MarketCard from "./MarketCard";
import { useGames } from "@azuro-org/sdk";

export default function TrendingMarkets() {
  const { data, isFetching } = useGames({ perPage: 3 });

  const games = data?.games ?? [];

  return (
    <section className="relative py-14 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <h2 className="text-center text-[var(--color-accent2)] text-2xl md:text-3xl font-extrabold tracking-tight mb-10 md:mb-14 uppercase drop-shadow-lg">
          Trending Markets
        </h2>

        {/* Loading skeleton */}
        {isFetching && games.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card animate-pulse p-6 flex flex-col gap-4"
              >
                <div className="h-4 bg-[var(--color-border)] rounded w-24 mb-4" />
                <div className="h-5 bg-[var(--color-border)] rounded w-full mb-2" />
                <div className="h-5 bg-[var(--color-border)] rounded w-3/4 mb-6" />
                <div className="flex gap-3 mb-6">
                  <div className="h-10 bg-[var(--color-border)] rounded flex-1" />
                  <div className="h-10 bg-[var(--color-border)] rounded flex-1" />
                </div>
                <div className="h-10 bg-[var(--color-border)] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Market cards grid */}
        {games.length > 0 && (
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
