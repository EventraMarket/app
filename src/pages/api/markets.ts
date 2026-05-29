/**
 * POST /api/markets  — save a newly created market (called from create.tsx after tx confirms)
 * GET  /api/markets  — list markets (supports ?category=&resolved=&page=&limit=)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import { Market } from "@/models/Market";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // ── GET ────────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { category, resolved, conditionId, page = "1", limit = "20" } = req.query;

    const filter: Record<string, unknown> = {};
    if (category && category !== "all") filter.category = category;
    if (resolved === "true") filter.resolved = true;
    if (resolved === "false") filter.resolved = false;
    if (conditionId) filter.conditionId = conditionId;

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

    return res.status(200).json({
      markets,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  }

  // ── POST ───────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
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
    } = req.body;

    if (!conditionId || !questionId || !title || !creator || !txHash) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Idempotent — skip if already saved (tx confirmed twice)
    const existing = await Market.findOne({ conditionId });
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
    });

    return res.status(201).json({ market, created: true });
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end();
}
