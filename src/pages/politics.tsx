

import { useEffect, useState } from "react";
import MarketCard from "@/components/MarketCard";
import { fetchPolymarketMarkets } from "@/lib/polymarket";
import { dummyEvents } from "@/lib/dummyEvents";

export default function PoliticsMarkets() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchPolymarketMarkets("Politics")
      .then((data) => {
        setMarkets(data);
        setLoading(false);
      })
      .catch(() => {
        setMarkets(dummyEvents);
        setError("Failed to fetch real markets. Showing sample events.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] pt-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Politics Markets</h1>
      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse p-6 h-56" />
            ))
          : markets.map((event) => <MarketCard key={event.gameId} game={event} />)}
      </div>
    </div>
  );
}
