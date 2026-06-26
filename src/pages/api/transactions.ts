
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "GET") {
    const { wallet, type, conditionId, page = "1", limit = "20", chainId } = req.query;
    
    const filter: Record<string, unknown> = {};
    if (wallet) filter.wallet = (wallet as string).toLowerCase();
    if (type) filter.type = type;
    if (conditionId) filter.conditionId = conditionId;
    
    // Read current chain selection context
    const requestChainId = chainId ? parseInt(chainId as string, 10) : 42220;

    // FIXED: Let Base Sepolia fetch entries where chainId is missing or explicit
    if (requestChainId === 84532) {
      (filter as any)["$or"] = [
        { chainId: 84532 },
        { chainId: { $exists: false } },
        { chainId: null }
      ];
    } else {
      filter.chainId = requestChainId;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, parseInt(limit as string, 10));

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ blockNumber: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      transactions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  }

  if (req.method === "POST") {
    const {
      txHash,
      type,
      wallet,
      conditionId,
      questionId,
      amount,
      amountRaw,
      outcomeIndex,
      blockNumber,
      timestamp,
      chainId,
    } = req.body;

    if (!txHash || !type || !wallet || blockNumber === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
//const allowed = ["split", "merge", "redeem", "resolve", "approve", "fpmm_buy", "fpmm_sell"];
    // ✅ Add FPMM transaction types
    const allowed = ["split", "merge", "redeem", "resolve", "approve", "fpmm_buy", "fpmm_sell"];
    if (!allowed.includes(type)) {
      return res.status(400).json({ error: `Invalid transaction type: ${type}` });
    }

    const existing = await Transaction.findOne({ txHash });
    if (existing) {
      return res.status(200).json({ transaction: existing, created: false });
    }

    const tx = await Transaction.create({
      txHash,
      type,
      wallet: wallet.toLowerCase(),
      conditionId: conditionId ?? null,
      questionId: questionId ?? null,
      amount: amount ?? "0",
      amountRaw: amountRaw ?? "0",
      outcomeIndex: outcomeIndex ?? null,
      blockNumber,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      chainId: chainId ? parseInt(chainId as string, 10) : 42220, // default to Celo Mainnet
    });

    return res.status(201).json({ transaction: tx, created: true });
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end();
}