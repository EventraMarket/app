// MarketsContext exports the custom useMarkets hook for market fetching from CTF Exchange
// export { useMarkets } from "@/lib/useMarkets";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Market } from "@/types/market";

interface MarketsContextType {
  markets: Market[];
  loading: boolean;
  refreshMarkets: () => Promise<void>;
}

const MarketsContext = createContext<MarketsContextType | undefined>(undefined);

export const MarketsProvider = ({ children }: { children: ReactNode }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { chainId } = useAccount();

  const refreshMarkets = async () => {
    setLoading(true);
    try {
      // Reference current active chain ID or fall back safely to Base Sepolia
      const activeChainId = chainId || baseSepolia.id;
      const response = await fetch(`/api/markets?chainId=${activeChainId}`);
      if (response.ok) {
        const data = await response.json();
        setMarkets(data);
      } else {
        console.error("Failed to sync markets with database query");
      }
    } catch (error) {
      console.error("Error fetching market arrays:", error);
    } finally {
      setLoading(false);
    }
  };

  // Automatically trigger sync lifecycle whenever the user alters their wallet chain network
  useEffect(() => {
    refreshMarkets();
  }, [chainId]);

  return (
    <MarketsContext.Provider value={{ markets, loading, refreshMarkets }}>
      {children}
    </MarketsContext.Provider>
  );
};

export const useMarketsContext = () => {
  const context = useContext(MarketsContext);
  if (!context) {
    throw new Error("useMarketsContext must be wrapper inside a valid MarketsProvider container");
  }
  return context;
};