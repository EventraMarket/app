

import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (mongoose.connection.readyState === 0) {
    if (!MONGODB_URI) {
      return res.status(500).json({ error: "MONGODB_URI not configured" });
    }
    try {
      await mongoose.connect(MONGODB_URI);
    } catch (err) {
      console.error("MongoDB connection error:", err);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }

  if (req.method === "GET") {
    try {
      const { Market } = await import("@/models/Market");
      const { category, resolved, conditionId, page = "1", limit = "50", chainId } = req.query;

      const filter: Record<string, unknown> = {};
      if (category && category !== "All" && category !== "all") filter.category = category;
      if (resolved === "true") filter.resolved = true;
      if (resolved === "false") filter.resolved = false;
      if (conditionId) filter.conditionId = conditionId;
    

       if (!conditionId) {
      filter.fpmmAddress = { $exists: true, $ne: null };
    }
      // conditionId is globally unique on-chain — NEVER apply a chainId filter when
      // looking up a specific market by conditionId. Applying it caused the "Market Not Found"
      // error because the default chainId (42220) didn't match the market's stored chainId.
      if (!conditionId) {
        const activeChainId = chainId ? parseInt(chainId as string, 10) : 42220;

        // Include legacy records (no chainId field) when querying Base Sepolia
        if (activeChainId === 84532) {
          (filter as any)["$or"] = [
            { chainId: 84532 },
            { chainId: { $exists: false } },
            { chainId: null },
          ];
        } else {
          filter.chainId = activeChainId;
        }
      }

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = conditionId ? 1 : Math.min(100, parseInt(limit as string, 10));

      const [markets, total] = await Promise.all([
        Market.find(filter)
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
        Market.countDocuments(filter),
      ]);

      const calculatedTotalPages = total > 0 ? Math.ceil(total / limitNum) : (markets.length > 0 ? 1 : 0);

      return res.status(200).json({
        markets,
        total: total || markets.length,
        page: pageNum,
        totalPages: calculatedTotalPages,
      });
    } catch (error) {
      console.error("Backend error fetching markets:", error);
      return res.status(500).json({
        markets: [],
        total: 0,
        page: 1,
        totalPages: 0,
        error: "Failed to fetch markets",
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { Market } = await import("@/models/Market");
      const {
        conditionId,
        questionId,
        title,
        category,
        outcomes,
        outcomeSlotCount,
        creator,
        resolver,
        txHash,
        blockNumber,
        chainId,
      } = req.body;

      if (!conditionId || !questionId || !title || !creator || !txHash || !chainId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await Market.findOne({ conditionId, chainId });
      if (existing) {
        return res.status(200).json({ market: existing, created: false });
      }

      const market = await Market.create({
        conditionId,
        questionId,
        title,
        category: category ?? "Other",
        outcomes: outcomes ?? ["Yes", "No"],
        outcomeSlotCount: outcomeSlotCount ?? 2,
        creator: creator.toLowerCase(),
        resolver: resolver?.toLowerCase() ?? "",
        txHash,
        blockNumber: blockNumber ?? 0,
        chainId: parseInt(chainId as string, 10),
      });

      return res.status(201).json({ market, created: true });
    } catch (error) {
      console.error("Backend error creating market:", error);
      return res.status(500).json({ error: "Failed to create market" });
    }
  }
  if (req.method === "PATCH") {
  try {
    const { Market } = await import("@/models/Market");
    const { conditionId, fpmmAddress } = req.body;
    if (!conditionId) {
      return res.status(400).json({ error: "conditionId required" });
    }
    const updated = await Market.findOneAndUpdate(
      { conditionId },
      { fpmmAddress },
      { new: true }
    );

    return res.status(200).json({ market: updated });
  } catch (error) {
    console.error("PATCH error:", error);
    return res.status(500).json({ error: "Failed to update market" });
  }
}

  res.setHeader("Allow", "GET, POST, PATCH");
  res.status(405).end();
}