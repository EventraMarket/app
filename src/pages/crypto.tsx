
import MarketCard from "@/components/MarketCard";
import { dummyEvents } from "@/lib/dummyEvents";

export default function CryptoMarkets() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] pt-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Crypto Markets</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {dummyEvents.map((event) => (
          <MarketCard key={event.gameId} game={event} />
        ))}
      </div>
    </div>
  );
}
