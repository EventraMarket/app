/**
 * scripts/sim-users.mjs
 *
 * Generates N fake wallet addresses and inserts a "split" Transaction record
 * for each one into MongoDB. This increases the Active Users count on the
 * dashboard (which counts distinct wallet addresses in the Transaction table).
 *
 * No on-chain transactions are made — records are written directly to MongoDB.
 *
 * Usage:
 *   node scripts/sim-users.mjs                   (default: 10 users)
 *   node scripts/sim-users.mjs --users=50        (add 50 users)
 *   node scripts/sim-users.mjs --trades=3        (transactions per user, default: 1)
 *   node scripts/sim-users.mjs --amount=25       (USDC amount per tx, default: 10)
 *   node scripts/sim-users.mjs --dry-run         (preview without writing to DB)
 *
 * Required .env:
 *   MONGODB_URI
 */

import mongoose from "mongoose";
import { config as dotenvConfig } from "dotenv";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { randomBytes } from "crypto";

dotenvConfig();

// ── Mongoose schemas ──────────────────────────────────────────────────────────
const MarketSchema = new mongoose.Schema(
  { conditionId: String, title: String, outcomes: [String], resolved: Boolean },
  { strict: false }
);

const TransactionSchema = new mongoose.Schema(
  {
    txHash:      { type: String, unique: true },
    type:        String,
    wallet:      String,
    conditionId: String,
    questionId:  String,
    amount:      String,
    amountRaw:   String,
    blockNumber: Number,
    timestamp:   Date,
    network:     { type: String, default: "base-sepolia" },
    success:     { type: Boolean, default: true },
  },
  { strict: false }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getArg(name, def) {
  const a = process.argv.find(a => a.startsWith(`--${name}=`));
  return a ? a.split("=").slice(1).join("=") : def;
}
function hasFlag(name) { return process.argv.includes(`--${name}`); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/** Fake but realistic-looking tx hash */
function fakeTxHash() {
  return "0x" + randomBytes(32).toString("hex");
}

/** Fake block number in a plausible recent range */
function fakeBlockNumber() {
  const base = 22_000_000;
  return base + Math.floor(Math.random() * 500_000);
}

/** Fake timestamp within the last 30 days */
function fakeTimestamp() {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return new Date(now - Math.floor(Math.random() * thirtyDays));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const MONGODB  = process.env.MONGODB_URI;
  const numUsers = parseInt(getArg("users", "10"), 10);
  const trades   = parseInt(getArg("trades", "1"), 10);
  const amount   = getArg("amount", "10");
  const isDryRun = hasFlag("dry-run");

  if (!MONGODB) { console.error("❌  MONGODB_URI not set"); process.exit(1); }

  console.log("\n👥  Active User Simulator");
  console.log(`    Users to add : ${numUsers}`);
  console.log(`    Trades each  : ${trades}`);
  console.log(`    Amount       : ${amount} USDC`);
  console.log(`    Dry run      : ${isDryRun}\n`);

  await mongoose.connect(MONGODB);
  const Market  = mongoose.models.Market      ?? mongoose.model("Market",      MarketSchema);
  const TxModel = mongoose.models.Transaction ?? mongoose.model("Transaction", TransactionSchema);

  const markets = await Market.find({ resolved: false }).lean();
  if (markets.length === 0) {
    console.error("❌  No active markets in DB. Run the seeder first.");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`📦  ${markets.length} active market(s) available\n`);

  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < numUsers; i++) {
    const wallet = privateKeyToAccount(generatePrivateKey()).address.toLowerCase();

    for (let t = 0; t < trades; t++) {
      const market     = pick(markets);
      const outcomes   = market.outcomes?.length >= 2 ? market.outcomes : ["Yes", "No"];
      const outcome    = pick(outcomes);
      const txHash     = fakeTxHash();
      const blockNum   = fakeBlockNumber();
      const timestamp  = fakeTimestamp();
      const amountRaw  = String(BigInt(Math.round(parseFloat(amount) * 1_000_000)));

      console.log(`  [${i + 1}/${numUsers}] ${wallet.slice(0, 20)}… → "${market.title?.slice(0, 45)}…" (${outcome})`);

      if (!isDryRun) {
        try {
          await TxModel.create({
            txHash,
            type:        "split",
            wallet,
            conditionId: market.conditionId ?? null,
            questionId:  market.questionId  ?? null,
            amount,
            amountRaw,
            blockNumber: blockNum,
            timestamp,
            network:     "base-sepolia",
            success:     true,
          });
          inserted++;
        } catch (err) {
          if (err?.code === 11000) {
            skipped++; // duplicate txHash (astronomically rare)
          } else {
            console.error(`    ❌  ${err.message}`);
          }
        }
      } else {
        inserted++;
      }
    }
  }

  await mongoose.disconnect();

  const label = isDryRun ? "Would insert" : "Inserted";
  console.log(`\n${"═".repeat(50)}`);
  console.log(`${label} : ${inserted} transaction(s) across ${numUsers} wallet(s)`);
  if (skipped) console.log(`Skipped  : ${skipped} (duplicate hash)`);
  console.log(`${"═".repeat(50)}\n`);

  if (!isDryRun) {
    console.log(`✅  Dashboard Active Users count will increase by up to ${numUsers}`);
  }
}

main().catch(err => {
  console.error("\nFatal:", err);
  process.exit(1);
});
