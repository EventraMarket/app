/**
 * Admin API routes — only callable by wallet addresses in the Admin collection.
 *
 * POST /api/admin/resolve  — resolve a market (marks it in DB + calls on-chain)
 * GET  /api/admin/admins   — list all admins
 * POST /api/admin/admins   — add a new admin (only existing admins can do this)
 * DELETE /api/admin/admins — remove an admin
 *
 * Auth: every request must include the header:
 *   X-Admin-Wallet: 0x...
 * We verify this wallet exists in the Admin collection.
 * The actual on-chain resolve() tx is sent by the frontend (walletClient), not this server.
 * This route records the resolution in MongoDB and validates admin status.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { Market } from "@/models/Market";
import { Transaction } from "@/models/Transaction";

// The deployer/owner wallet that was seeded as the first admin.
// Set this to your deployer wallet in .env.local as ADMIN_SEED_WALLET.
//const SEED_ADMIN = `process.env.ADMIN_SEED_WALLET`.toLowerCase();
//const SEED_ADMIN ="0xb00d418b513a12984436eC4d8171594d4b1292d9".toLocaleLowerCase();
const SEED_ADMIN = '0xd3C8c75D47BF2cbE9073Ab5bf66afAC41AaD4bf6'.toLowerCase()
async function isAdmin(wallet: string): Promise<boolean> {
  if (!wallet) return false;
  const w = wallet.toLowerCase();
  if (SEED_ADMIN && w === SEED_ADMIN) return true;
  const rec = await Admin.findOne({ wallet: w, active: true });
  return !!rec;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error("[admin] DB connection failed:", err);
    return res.status(500).json({ error: "Database connection failed", detail: String(err) });
  }

  const callerWallet =
    typeof req.headers["x-admin-wallet"] === "string"
      ? req.headers["x-admin-wallet"].toLowerCase()
      : "";

  const path = req.query.action as string | undefined;

  // ── POST /api/admin?action=resolve ─────────────────────────────────────────
  if (req.method === "POST" && path === "resolve") {
    if (!(await isAdmin(callerWallet))) {
      return res.status(403).json({ error: "Forbidden: not an admin" });
    }

    const { conditionId, winnerIndex, winner, txHash, blockNumber } = req.body;

    if (!conditionId || winnerIndex === undefined || !txHash) {
      return res.status(400).json({ error: "Missing: conditionId, winnerIndex, txHash" });
    }

    const market = await Market.findOne({ conditionId });
    if (!market) {
      return res.status(404).json({ error: "Market not found in database" });
    }
    if (market.resolved) {
      return res.status(409).json({ error: "Market already resolved" });
    }

    market.resolved = true;
    market.winner = winner ?? market.outcomes[winnerIndex] ?? null;
    market.winnerIndex = winnerIndex;
    market.resolvedAt = new Date();
    market.resolvedBy = callerWallet;
    market.resolveTxHash = txHash;
    await market.save();

    // Record as a transaction
    await Transaction.findOneAndUpdate(
      { txHash },
      {
        txHash,
        type: "resolve",
        wallet: callerWallet,
        conditionId,
        amount: "0",
        amountRaw: "0",
        blockNumber: blockNumber ?? 0,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ market });
  }

  // ── GET /api/admin?action=admins ───────────────────────────────────────────
  if (req.method === "GET" && path === "admins") {
    if (!(await isAdmin(callerWallet))) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const admins = await Admin.find({ active: true }).lean();
    return res.status(200).json({ admins });
  }

  // ── POST /api/admin?action=admins  — add admin ─────────────────────────────
  if (req.method === "POST" && path === "admins") {
    if (!(await isAdmin(callerWallet))) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "wallet required" });

    const admin = await Admin.findOneAndUpdate(
      { wallet: wallet.toLowerCase() },
      { wallet: wallet.toLowerCase(), addedBy: callerWallet, active: true, addedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.status(201).json({ admin });
  }

  // ── DELETE /api/admin?action=admins ───────────────────────────────────────
  if (req.method === "DELETE" && path === "admins") {
    if (!(await isAdmin(callerWallet))) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "wallet required" });
    if (wallet.toLowerCase() === SEED_ADMIN) {
      return res.status(400).json({ error: "Cannot remove the seed admin" });
    }
    await Admin.findOneAndUpdate({ wallet: wallet.toLowerCase() }, { active: false });
    return res.status(200).json({ ok: true });
  }

  // ── GET /api/admin?action=markets — all markets for admin review ───────────
  if (req.method === "GET" && path === "markets") {
    if (!(await isAdmin(callerWallet))) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const markets = await Market.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.status(200).json({ markets });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  res.status(405).end();
}
