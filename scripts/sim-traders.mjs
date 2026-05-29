/**
 * scripts/sim-traders.mjs
 *
 * Simulation script that:
 *  1. Generates N fresh wallets
 *  2. Funds each with 0.001 ETH from the admin wallet
 *  3. Each wallet calls faucet() to claim 1000 mock-USDC
 *  4. Each wallet randomly picks a market + outcome and does a splitPosition trade
 *
 * Usage:
 *   node scripts/sim-traders.mjs
 *   node scripts/sim-traders.mjs --wallets=5        (default: 10)
 *   node scripts/sim-traders.mjs --amount=5         (USDC per trade, default: 10)
 *   node scripts/sim-traders.mjs --trades=3         (trades per wallet, default: 1)
 *   node scripts/sim-traders.mjs --rounds=5         (how many batches to run, default: infinite)
 *   node scripts/sim-traders.mjs --rest=30          (seconds between batches, default: 30)
 *   node scripts/sim-traders.mjs --dry-run          (no txs, just log actions)
 *
 * Required .env:
 *   ADMIN_PRIVATE_KEY   Funds the generated wallets with ETH
 *   MONGODB_URI         Reads markets from DB to trade on
 *
 * Optional .env:
 *   RPC_URL             Defaults to https://sepolia.base.org
 */

import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  parseUnits,
  formatUnits,
  encodePacked,
  keccak256,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import mongoose from "mongoose";
import { config as dotenvConfig } from "dotenv";
import { writeFileSync } from "fs";

dotenvConfig();

// ── Contract addresses ───────────────────────────────────────────────────────
const ADDR = {
  USDC:              "0x390BF67966Eb8afcA25D7515441a77AE6CD4E039",
  CONDITIONAL_TOKEN: "0xEf457f01CBF71EBd9DF6f00dC6862B830dC187CD",
};

const ETH_PER_WALLET  = parseEther("0.001");
const FAUCET_AMOUNT   = parseUnits("1000", 6);   // 1000 mock-USDC per wallet
const USDC_DECIMALS   = 6;

// ── Minimal ABIs ─────────────────────────────────────────────────────────────
const FAUCET_ABI = [
  {
    inputs: [
      { name: "to",     type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount",  type: "uint256" },
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const SPLIT_POSITION_ABI = [
  {
    inputs: [
      { name: "collateralToken",      type: "address"    },
      { name: "parentCollectionId",   type: "bytes32"    },
      { name: "conditionId",          type: "bytes32"    },
      { name: "partition",            type: "uint256[]"  },
      { name: "amount",               type: "uint256"    },
    ],
    name: "splitPosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// ── Mongoose Market schema (read-only) ───────────────────────────────────────
const MarketSchema = new mongoose.Schema(
  {
    conditionId: String,
    title: String,
    category: String,
    outcomes: [String],
    resolved: { type: Boolean, default: false },
  },
  { strict: false }
);

// ── Mongoose Transaction schema (write) ──────────────────────────────────────
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
  },
  { strict: false }
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function getArg(name, def) {
  const a = process.argv.find(a => a.startsWith(`--${name}=`));
  return a ? a.split("=").slice(1).join("=") : def;
}
function hasFlag(name) { return process.argv.includes(`--${name}`); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Main ─────────────────────────────────────────────────────────────────────
// ── Run one batch of N wallets ───────────────────────────────────────────────
async function runBatch({
  round, numWallets, tradeAmount, tradesEach, isDryRun,
  publicClient, adminWallet, markets, TxModel, RPC_URL,
}) {
  console.log(`\n${"|=".repeat(30)}`);
  console.log(`  ROUND ${round}  —  ${new Date().toLocaleTimeString()}`);
  console.log(`${"|=".repeat(30)}\n`);

  // ── Generate fresh wallets for this batch ──────────────────────────────────
  const wallets = Array.from({ length: numWallets }, (_, i) => {
    const privateKey = generatePrivateKey();
    const account    = privateKeyToAccount(privateKey);
    return { index: i + 1, privateKey, address: account.address, account };
  });

  if (!isDryRun) {
    const logPath = `scripts/sim-wallets-r${round}-${Date.now()}.json`;
    writeFileSync(logPath, JSON.stringify(
      wallets.map(w => ({ address: w.address, privateKey: w.privateKey })),
      null, 2
    ));
    console.log(`💾  Wallets saved to ${logPath}\n`);
  }

  const results = [];

  for (const w of wallets) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`[R${round} ${w.index}/${numWallets}] 👛  ${w.address}`);

    const result = { address: w.address, funded: false, faucet: false, trades: [] };

    try {
      // ── Step 1: Fund with ETH ────────────────────────────────────────────
      console.log(`    ⏳  Sending 0.001 ETH...`);
      if (!isDryRun) {
        const ethHash = await adminWallet.sendTransaction({
          to: w.address,
          value: ETH_PER_WALLET,
        });
        await publicClient.waitForTransactionReceipt({ hash: ethHash });
        console.log(`    ✅  Funded  (tx: ${ethHash.slice(0, 20)}...)`);
      } else {
        console.log(`    [DRY RUN] Would send 0.001 ETH`);
      }
      result.funded = true;
      await sleep(500);

      // ── Step 2: Claim faucet USDC ────────────────────────────────────────
      console.log(`    ⏳  Claiming 1000 mock-USDC from faucet...`);
      if (!isDryRun) {
        const wClient = createWalletClient({
          account: w.account,
          chain: baseSepolia,
          transport: http(RPC_URL),
        });
        const faucetHash = await wClient.writeContract({
          address: ADDR.USDC,
          abi: FAUCET_ABI,
          functionName: "faucet",
          args: [w.address, FAUCET_AMOUNT],
        });
        await publicClient.waitForTransactionReceipt({ hash: faucetHash });
        console.log(`    ✅  Faucet  (tx: ${faucetHash.slice(0, 20)}...)`);
      } else {
        console.log(`    [DRY RUN] Would claim 1000 USDC from faucet`);
      }
      result.faucet = true;
      await sleep(500);

      // ── Step 3: Trade on random markets ──────────────────────────────────
      for (let t = 0; t < tradesEach; t++) {
        const market   = pick(markets);
        const outcomes = market.outcomes?.length >= 2 ? market.outcomes : ["Yes", "No"];
        const outcome  = pick(outcomes);
        const outcomeIndex = outcomes.indexOf(outcome);
        const partition = outcomeIndex === 0 ? [BigInt(1), BigInt(2)] : [BigInt(2), BigInt(1)];
        const amountParsed = parseUnits(tradeAmount, USDC_DECIMALS);

        console.log(`    ⏳  Trade ${t + 1}/${tradesEach}: "${market.title?.slice(0, 50)}…"`);
        console.log(`           Outcome: "${outcome}"  |  Amount: ${tradeAmount} USDC`);

        if (!isDryRun) {
          const wClient = createWalletClient({
            account: w.account,
            chain: baseSepolia,
            transport: http(RPC_URL),
          });

          const approveHash = await wClient.writeContract({
            address: ADDR.USDC,
            abi: ERC20_APPROVE_ABI,
            functionName: "approve",
            args: [ADDR.CONDITIONAL_TOKEN, amountParsed],
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });

          const splitHash = await wClient.writeContract({
            address: ADDR.CONDITIONAL_TOKEN,
            abi: SPLIT_POSITION_ABI,
            functionName: "splitPosition",
            args: [
              ADDR.USDC,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              market.conditionId,
              partition,
              amountParsed,
            ],
          });
          const splitReceipt = await publicClient.waitForTransactionReceipt({ hash: splitHash });
          console.log(`    ✅  Trade done (tx: ${splitHash.slice(0, 20)}...)`);

          await TxModel.create({
            txHash:      splitHash,
            type:        "split",
            wallet:      w.address.toLowerCase(),
            conditionId: market.conditionId ?? null,
            questionId:  market.questionId ?? null,
            amount:      tradeAmount,
            amountRaw:   amountParsed.toString(),
            outcomeIndex,
            blockNumber: Number(splitReceipt.blockNumber),
            timestamp:   new Date(),
          }).catch(() => {});

          result.trades.push({ market: market.title, outcome, amount: tradeAmount, tx: splitHash });
        } else {
          console.log(`    [DRY RUN] Would trade`);
          result.trades.push({ market: market.title, outcome, amount: tradeAmount });
        }

        await sleep(1000);
      }

    } catch (err) {
      const msg = err?.shortMessage ?? err?.message ?? String(err);
      console.error(`    ❌  Error: ${msg.slice(0, 150)}`);
      result.error = msg.slice(0, 150);
    }

    results.push(result);
  }

  const funded   = results.filter(r => r.funded).length;
  const fauceted = results.filter(r => r.faucet).length;
  const traded   = results.filter(r => r.trades.length > 0).length;
  const failed   = results.filter(r => r.error).length;

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  Round ${round} summary`);
  console.log(`✅  Funded wallets  : ${funded}/${numWallets}`);
  console.log(`💧  Claimed faucet  : ${fauceted}/${numWallets}`);
  console.log(`📊  Wallets traded  : ${traded}/${numWallets}`);
  console.log(`❌  Errors          : ${failed}`);
  console.log(`${"═".repeat(60)}\n`);
}

async function main() {
  const ADMIN_PK  = process.env.ADMIN_PRIVATE_KEY;
  const MONGODB   = process.env.MONGODB_URI;
  const RPC_URL   = process.env.RPC_URL ?? "https://sepolia.base.org";

  const numWallets  = parseInt(getArg("wallets", "10"), 10);
  const tradeAmount = getArg("amount", "10");
  const tradesEach  = parseInt(getArg("trades", "1"), 10);
  const maxRounds   = parseInt(getArg("rounds", "0"), 10);  // 0 = infinite
  const restSecs    = parseInt(getArg("rest", "30"), 10);
  const isDryRun    = hasFlag("dry-run");

  if (!MONGODB)   { console.error("❌  MONGODB_URI not set"); process.exit(1); }
  if (!isDryRun && !ADMIN_PK) {
    console.error("❌  ADMIN_PRIVATE_KEY not set (required unless --dry-run)");
    process.exit(1);
  }

  console.log("\n🤖  Prediction Market Trader Simulator");
  console.log(`    Wallets/batch: ${numWallets}`);
  console.log(`    Trade size   : ${tradeAmount} USDC`);
  console.log(`    Trades each  : ${tradesEach}`);
  console.log(`    Rounds       : ${maxRounds === 0 ? "infinite" : maxRounds}`);
  console.log(`    Rest between : ${restSecs}s`);
  console.log(`    Dry run      : ${isDryRun}\n`);

  // ── Clients (created once, reused across rounds) ───────────────────────────
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });

  let adminWallet;
  if (!isDryRun) {
    const pk = ADMIN_PK.startsWith("0x") ? ADMIN_PK : `0x${ADMIN_PK}`;
    adminWallet = createWalletClient({
      account: privateKeyToAccount(pk),
      chain: baseSepolia,
      transport: http(RPC_URL),
    });
    console.log(`🔑  Admin: ${adminWallet.account.address}\n`);
  }

  // ── MongoDB — stay connected for all rounds ────────────────────────────────
  await mongoose.connect(MONGODB);
  const Market  = mongoose.models.Market      ?? mongoose.model("Market",      MarketSchema);
  const TxModel = mongoose.models.Transaction ?? mongoose.model("Transaction", TransactionSchema);

  // ── Round loop ─────────────────────────────────────────────────────────────
  let round = 1;
  while (true) {
    // Re-fetch markets each round so newly seeded markets are included
    const markets = await Market.find({ resolved: false }).lean();
    if (markets.length === 0) {
      console.error("❌  No active markets in DB. Run the seeder first.");
      await mongoose.disconnect();
      process.exit(1);
    }
    console.log(`📦  ${markets.length} active market(s) in DB`);

    if (!isDryRun) {
      const adminBal = await publicClient.getBalance({ address: adminWallet.account.address });
      const required = ETH_PER_WALLET * BigInt(numWallets);
      console.log(`💰  Admin balance: ${formatUnits(adminBal, 18)} ETH (need ${formatUnits(required, 18)})`);
      if (adminBal < required) {
        console.error(`❌  Insufficient ETH for round ${round}. Stopping.`);
        break;
      }
    }

    await runBatch({ round, numWallets, tradeAmount, tradesEach, isDryRun,
                     publicClient, adminWallet, markets, TxModel, RPC_URL });

    if (maxRounds > 0 && round >= maxRounds) {
      console.log(`\n🏁  Reached ${maxRounds} round(s). Done.`);
      break;
    }

    round++;
    console.log(`⏸   Resting ${restSecs}s before round ${round}... (Ctrl+C to stop)\n`);
    await sleep(restSecs * 1000);
  }

  await mongoose.disconnect();
  console.log("👋  All done.");
}

main().catch(err => {
  console.error("\nFatal:", err);
  process.exit(1);
});
