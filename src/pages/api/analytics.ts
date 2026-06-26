
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export type AnalyticsResponse = {
  totalMarkets: number;
  resolvedMarkets: number;
  totalVolume: string;
  totalSplits: number;
  totalRedemptions: number;
  totalTransactions: number;
  totalUniqueWallets: number;
  recentMarkets: {
    conditionId: string;
    questionId: string;
    title: string;
    category: string;
    outcomeSlotCount: number;
    resolved: boolean;
    winner: string | null;
    blockNumber: number;
    createdAt: string;
  }[];
  wallet?: {
    address: string;
    marketsCreated: number;
    splitVolume: string;
    redemptionVolume: string;
    recentActivity: {
      txHash: string;
      type: string;
      conditionId: string | null;
      amount: string;
      blockNumber: number;
      timestamp: string;
    }[];
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      totalMarkets: 0,
      resolvedMarkets: 0,
      totalVolume: "0",
      totalSplits: 0,
      totalRedemptions: 0,
      totalTransactions: 0,
      totalUniqueWallets: 0,
      recentMarkets: [],
      error: "Method not allowed",
    });
  }

  try {
    await connectToDatabase();

    const requestChainId = req.query.chainId
      ? parseInt(req.query.chainId as string, 10)
      : 42220;
    const userAddressParam = (req.query.address as string)?.toLowerCase();

    const { Market } = await import("@/models/Market");
    const { Transaction } = await import("@/models/Transaction");

    // Build chain filter (supports Base Sepolia legacy records)
    const chainFilter: Record<string, any> = {};
    if (requestChainId === 84532) {
      chainFilter["$or"] = [
        { chainId: 84532 },
        { chainId: { $exists: false } },
        { chainId: null },
      ];
    } else {
      chainFilter.chainId = requestChainId;
    }

    const [markets, transactions] = await Promise.all([
      Market.find(chainFilter).lean(),
      Transaction.find(chainFilter).lean(),
    ]);

    const totalMarkets = markets.length;
    const resolvedMarkets = markets.filter((m: any) => m.resolved).length;

    // ✅ NEW: Sum volume from all transactions that move value
    // Exclude 'approve' (no value transfer), include everything else
    const totalVolume = transactions
      .filter((t: any) => !["approve"].includes(t.type))
      .reduce((sum: number, t: any) => {
        const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount || 0;
        return sum + amount;
      }, 0)
      .toFixed(2);

    // Keep split count separate
    const totalSplits = transactions.filter((t: any) => t.type === "split").length;
    const totalRedemptions = transactions.filter((t: any) => t.type === "redeem").length;
    const totalTransactions = transactions.length;

    const uniqueWalletsSet = new Set(
      transactions.map((t: any) => t.wallet?.toLowerCase()).filter(Boolean)
    );
    const totalUniqueWallets = uniqueWalletsSet.size;

    const recentMarkets = markets.slice(0, 10).map((m: any) => ({
      conditionId: m.conditionId || "",
      questionId: m.questionId || "",
      title: m.title || "",
      category: m.category || "General",
      outcomeSlotCount: m.outcomes?.length || 2,
      resolved: !!m.resolved,
      winner: m.winner || null,
      blockNumber: m.blockNumber || 0,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
    }));

    // Wallet-specific stats
    let walletResponse: AnalyticsResponse["wallet"] = undefined;
    if (userAddressParam) {
      const marketsCreatedCount = markets.filter(
        (m: any) => m.creator?.toLowerCase() === userAddressParam
      ).length;

      const userTxs = transactions.filter(
        (t: any) => t.wallet?.toLowerCase() === userAddressParam
      );

      const userSplitVol = userTxs
        .filter((t: any) => t.type === "split")
        .reduce((sum: number, t: any) => {
          const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount || 0;
          return sum + amount;
        }, 0)
        .toFixed(2);

      const userRedeemVol = userTxs
        .filter((t: any) => t.type === "redeem")
        .reduce((sum: number, t: any) => {
          const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount || 0;
          return sum + amount;
        }, 0)
        .toFixed(2);

      const recentActivity = userTxs.slice(0, 20).map((t: any) => ({
        txHash: t.txHash || "",
        type: t.type || "transaction",
        conditionId: t.conditionId || null,
        amount: (t.amount || 0).toString(),
        blockNumber: t.blockNumber || 0,
        timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
      }));

      walletResponse = {
        address: userAddressParam,
        marketsCreated: marketsCreatedCount,
        splitVolume: userSplitVol,
        redemptionVolume: userRedeemVol,
        recentActivity,
      };
    }

    return res.status(200).json({
      totalMarkets,
      resolvedMarkets,
      totalVolume,
      totalSplits,
      totalRedemptions,
      totalTransactions,
      totalUniqueWallets,
      recentMarkets,
      wallet: walletResponse,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return res.status(500).json({
      totalMarkets: 0,
      resolvedMarkets: 0,
      totalVolume: "0",
      totalSplits: 0,
      totalRedemptions: 0,
      totalTransactions: 0,
      totalUniqueWallets: 0,
      recentMarkets: [],
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}