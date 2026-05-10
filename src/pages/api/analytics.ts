/**
 * GET /api/analytics
 * Returns protocol-wide stats from MongoDB (populated by on-chain indexer).
 *
 * Optional query params:
 *   ?address=0x...  — also returns per-wallet stats for that address
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import { Market } from "@/models/Market";
import { Transaction } from "@/models/Transaction";

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
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  const walletAddress =
    typeof req.query.address === "string"
      ? req.query.address.toLowerCase()
      : null;

  try {
    await connectDB();

    const [
      totalMarkets,
      resolvedMarkets,
      totalSplits,
      totalRedemptions,
      totalTransactions,
      uniqueWalletsAgg,
      recentMarketDocs,
      volumeAgg,
    ] = await Promise.all([
      Market.countDocuments(),
      Market.countDocuments({ resolved: true }),
      Transaction.countDocuments({ type: "split" }),
      Transaction.countDocuments({ type: "redeem" }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $group: { _id: "$wallet" } },
        { $count: "count" },
      ]),
      Market.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Transaction.aggregate([
        { $match: { type: "split" } },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ]),
    ]);

    const totalVolume = volumeAgg[0]?.total?.toFixed(2) ?? "0";

    const recentMarkets = recentMarketDocs.map((m) => ({
      conditionId: m.conditionId,
      questionId: m.questionId,
      title: m.title,
      category: m.category,
      outcomeSlotCount: m.outcomeSlotCount,
      resolved: m.resolved,
      winner: m.winner,
      blockNumber: m.blockNumber,
      createdAt: m.createdAt.toISOString(),
    }));

    const totalUniqueWallets = uniqueWalletsAgg[0]?.count ?? 0;

    const response: AnalyticsResponse = {
      totalMarkets,
      resolvedMarkets,
      totalVolume,
      totalSplits,
      totalRedemptions,
      totalTransactions,
      totalUniqueWallets,
      recentMarkets,
    };

    // Per-wallet stats
    if (walletAddress) {
      const [
        marketsCreated,
        walletSplitAgg,
        walletRedeemAgg,
        recentTxs,
      ] = await Promise.all([
        Market.countDocuments({ creator: walletAddress }),
        Transaction.aggregate([
          { $match: { wallet: walletAddress, type: "split" } },
          { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
        ]),
        Transaction.aggregate([
          { $match: { wallet: walletAddress, type: "redeem" } },
          { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
        ]),
        Transaction.find({ wallet: walletAddress })
          .sort({ blockNumber: -1 })
          .limit(20)
          .lean(),
      ]);

      response.wallet = {
        address: walletAddress,
        marketsCreated,
        splitVolume: walletSplitAgg[0]?.total?.toFixed(2) ?? "0",
        redemptionVolume: walletRedeemAgg[0]?.total?.toFixed(2) ?? "0",
        recentActivity: recentTxs.map((t) => ({
          txHash: t.txHash,
          type: t.type,
          conditionId: t.conditionId,
          amount: t.amount,
          blockNumber: t.blockNumber,
          timestamp: t.timestamp.toISOString(),
        })),
      };
    }

    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
    res.status(200).json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch analytics";
    res.status(500).json({
      totalMarkets: 0,
      resolvedMarkets: 0,
      totalVolume: "0",
      totalSplits: 0,
      totalRedemptions: 0,
      totalTransactions: 0,
      totalUniqueWallets: 0,
      recentMarkets: [],
      error: msg,
    });
  }
}

