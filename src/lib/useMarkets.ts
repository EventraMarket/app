import { useEffect, useState } from "react";

export interface Market {
  gameId: string;
  title: string;
  startsAt: string;
  conditionId: `0x${string}` | null;
  questionId: `0x${string}` | null;
  sport: { name: string };
  league: { name: string };
  participants: { name: string }[];
  category?: string;
  outcomes?: string[];
  resolved?: boolean;
}

export function useMarkets(page: number = 1, perPage: number = 20) {
  const [data, setData] = useState<{
    games: Market[];
    totalPages: number;
    total: number;
  } | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setIsFetching(true);

        const res = await fetch(`/api/markets?page=${page}&limit=${perPage}`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();

        const dbMarkets: Market[] = (json.markets ?? []).map(
          (m: {
            conditionId: string;
            questionId: string;
            title: string;
            category: string;
            outcomes: string[];
            resolved: boolean;
            createdAt: string;
          }) => ({
            gameId: m.conditionId,
            title: m.title,
            conditionId: m.conditionId as `0x${string}`,
            questionId: m.questionId as `0x${string}`,
            startsAt: `${Math.floor(new Date(m.createdAt).getTime() / 1000)}`,
            sport: { name: m.category ?? "Prediction" },
            league: { name: "Base Sepolia" },
            participants: (m.outcomes ?? ["Yes", "No"]).map((o: string) => ({ name: o })),
            category: m.category,
            outcomes: m.outcomes,
            resolved: m.resolved,
          })
        );

        if (dbMarkets.length > 0) {
          setData({
            games: dbMarkets,
            totalPages: json.totalPages ?? 1,
            total: json.total ?? dbMarkets.length,
          });
          setError(null);
          return;
        }

        // No markets in DB yet
        setData({ games: [], totalPages: 1, total: 0 });
        setError(null);
      } catch {
        setData({ games: [], totalPages: 1, total: 0 });
        setError("Failed to load markets");
      } finally {
        setIsFetching(false);
      }
    }

    fetchMarkets();
  }, [page, perPage]);

  return { data, isFetching, error };
}

