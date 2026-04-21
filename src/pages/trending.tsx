
import MarketCard from "@/components/MarketCard";
import { dummyEvents } from "@/lib/dummyEvents";

export default function Trending() {
  return (
    <div className="min-h-screen text-[var(--color-foreground)] pt-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Trending Markets</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {dummyEvents.map((event) => (
          <MarketCard key={event.gameId} game={event} />
        ))}
      </div>
    </div>
  );
}
