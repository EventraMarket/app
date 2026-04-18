// Simple Polymarket API fetcher for markets by category
// Docs: https://docs.polymarket.com/

export async function fetchPolymarketMarkets(category: string) {
  // Polymarket API endpoint for markets
  const url = `https://api.polymarket.com/v4/markets?category=${encodeURIComponent(category)}&limit=12&sort=liquidityUSD&order=desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Polymarket markets");
  const data = await res.json();
  // Normalize to your MarketCard format
  return (data.markets || []).map((m: any) => ({
    gameId: m.id,
    title: m.question,
    startsAt: m.endTime ? String(Math.floor(new Date(m.endTime).getTime() / 1000)) : "0",
    sport: { name: m.category || category },
    league: { name: m.category || category },
    participants: [
      { name: m.outcomes?.[0]?.title || "Yes" },
      { name: m.outcomes?.[1]?.title || "No" },
    ],
  }));
}
