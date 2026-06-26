
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { celo, baseSepolia, celoSepolia } from "wagmi/chains";

// Single source of truth for chain id -> display name, derived from wagmi's
// own chain definitions instead of hardcoded strings scattered across
// components. Add new chains here and every display spot picks it up.
export const CHAIN_NAMES: Record<number, string> = {
  [celo.id]: celo.name,
  [celoSepolia.id]: celoSepolia.name,
  [baseSepolia.id]: baseSepolia.name,
};

export function getChainName(chainId: number | undefined | null): string {
  if (!chainId) return "Unknown Network";
  return CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
}

export interface TransformedMarket {
  gameId: string;
  title: string;
  startsAt: string;
  conditionId: string;
  questionId: string;
  sport: { name: string };
  league: { name: string };
  participants: { name: string }[];
  category: string;
  outcomes: string[];
  resolved: boolean;
  chainId: number;
  fpmmAddress: string;
}

export function useMarkets(page: number = 1, perPage: number = 50) {
  const [data, setData] = useState<{
    games: TransformedMarket[];
    totalPages: number;
    total: number;
  } | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { chainId } = useAccount();

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setIsFetching(true);
        // Fallback default network is Celo Mainnet (42220) if disconnected
        const activeChainId = chainId || celo.id;

        // FIXED: Added &chainId=${activeChainId} to separate the database queries!
        const res = await fetch(`/api/markets?page=${page}&limit=${perPage}&chainId=${activeChainId}`);
        if (!res.ok) throw new Error("API Route Sync Error");
        
        const response = await res.json();
        const rawMarkets = response.markets || [];
        const totalPages = response.totalPages || 1;
        const total = response.total || 0;

        // Safely map MongoDB documents into the structured view models expected by components.
        // Each market's network label comes from ITS OWN chainId, not the
        // currently-connected wallet's chain — those can disagree (e.g.
        // browsing while connected to a different network than the market
        // was created on).
        const transformed: TransformedMarket[] = rawMarkets.map((m: any) => ({
          gameId: m.questionId || m._id,
          title: m.title || "",
          conditionId: m.conditionId || m.questionId || "",
          questionId: m.questionId || "",
          startsAt: `${Math.floor(new Date(m.createdAt || Date.now()).getTime() / 1000)}`,
          sport: { name: m.category || "Prediction" },
          league: { name: getChainName(m.chainId) },
          participants: (m.outcomes || ["Yes", "No"]).map((o: string) => ({ name: o })),
          category: m.category || "General",
          outcomes: m.outcomes || ["Yes", "No"],
          resolved: !!m.resolved,
          chainId: m.chainId,
        }));

        setData({
          games: transformed,
          totalPages,
          total,
        });
        setError(null);
      } catch (err) {
        console.error("Error formatting multi-chain market hooks:", err);
        setData({ games: [], totalPages: 1, total: 0 });
        setError("Failed to sync markets");
      } finally {
        setIsFetching(false);
      }
    }

    fetchMarkets();
  }, [chainId, page, perPage]);

  return { data, isFetching, error };
}