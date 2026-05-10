import MarketCard from "@/components/MarketCard";
import { useMarkets } from "@/lib/useMarkets";

export default function CultureMarkets() {
  const { data, isFetching } = useMarkets(1, 100);
  const games = (data?.games ?? []).filter((g) => g.category?.toLowerCase() === "culture");
  return (
    <div className="min-h-screen text-[var(--color-foreground)] pt-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Culture Markets</h1>
      {isFetching && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#F3B21A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!isFetching && games.length === 0 && (
        <p className="text-center text-[#D9A650]/60 py-20">No culture markets available yet.</p>
      )}
      {!isFetching && games.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {games.map((game) => (
            <MarketCard key={game.gameId} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
