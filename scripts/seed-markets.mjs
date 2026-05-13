/**
 * scripts/seed-markets.mjs
 *
 * Fetches active markets from the Polymarket Gamma API and creates them
 * on-chain (Base Sepolia) + saves metadata to MongoDB.
 *
 * Usage:
 *   node scripts/seed-markets.mjs [options]
 *
 * Options:
 *   --limit=<n>        Number of NEW markets to create (default: 5; already-existing
 *                      markets are skipped and don\'t count toward this limit)
 *   --tag=<tag>        Keyword filter, e.g. "crypto", "bitcoin", "trump", "sports"
 *   --category=<cat>   Only create markets mapped to this app category, e.g. "Crypto"
 *   --dry-run          Fetch and log markets without sending any transactions
 *
 * Required .env vars:
 *   MONGODB_URI        MongoDB connection string
 *   ADMIN_PRIVATE_KEY  Private key (with or without 0x prefix) of the deployer wallet
 *
 * Optional .env vars:
 *   RPC_URL            Base Sepolia RPC (defaults to https://sepolia.base.org)
 */

import { createWalletClient, createPublicClient, http, keccak256, encodePacked } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import mongoose from "mongoose";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// ── Contract addresses (Base Sepolia) ────────────────────────────────────────
const CONTRACT_ADDRESSES = {
  CONDITIONAL_TOKEN: "0xEf457f01CBF71EBd9DF6f00dC6862B830dC187CD",
  SIMPLE_RESOLVER:   "0x14E2Da779C2d497271B0e873397Dbd6927db70f9",
};

const PREPARE_CONDITION_ABI = [
  {
    inputs: [
      { name: "oracle",            type: "address"  },
      { name: "questionId",        type: "bytes32"  },
      { name: "outcomeSlotCount",  type: "uint256"  },
    ],
    name: "prepareCondition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// ── Polymarket tag → app category mapping ────────────────────────────────────
// ── Category detection rules (checked in order, first match wins) ────────────
// The Polymarket Gamma API does NOT return a "tags" array. Instead we derive
// the category from fields that ARE present in the response:
//   • feeType       e.g. "sports_fees_v2", "finance_prices_fees", "mentions_fees"
//   • events[].series[].slug  e.g. "league-of-legends", "nfl-spreads"
//   • The question text itself

const CATEGORY_RULES = [
  // ── Esports (must come before Sports so "esports" slug wins) ─────────────
  {
    cat: "Esports",
    feeTypes: ["esports"],
    slugs: ["league-of-legends", "dota", "cs2", "valorant", "overwatch", "esports"],
    keywords: ["esports", "lol:", "dota", "cs2", "valorant", "overwatch", "cblol", "lck", "lec", "lcs"],
  },
  // ── Sports ────────────────────────────────────────────────────────────────
  {
    cat: "Sports",
    feeTypes: ["sports", "sports_fees", "sports_fees_v2"],
    slugs: ["nfl", "nba", "mlb", "nhl", "soccer", "tennis", "golf", "ufc", "mma", "rugby", "cricket"],
    keywords: ["nfl", "nba", "mlb", "nhl", " ufc ", "mma ", "super bowl", "world cup", "champions league", "premier league", "la liga", "bundesliga", "serie a", " f1 ", "formula 1"],
  },
  // ── Crypto ────────────────────────────────────────────────────────────────
  {
    cat: "Crypto",
    feeTypes: ["crypto", "crypto_fees"],
    slugs: ["bitcoin", "ethereum", "solana", "crypto", "defi", "nft"],
    keywords: ["bitcoin", " btc ", "ethereum", " eth ", "solana", " sol ", " xrp", "ripple", " bnb", "dogecoin", " doge", "crypto", "blockchain", "defi", "nft", "altcoin", "stablecoin"],
  },
  // ── Finance ───────────────────────────────────────────────────────────────
  {
    cat: "Finance",
    feeTypes: ["finance", "finance_prices_fees", "finance_fees"],
    slugs: ["stock", "stocks", "spy", "nasdaq", "dow-jones", "finance"],
    keywords: ["s&p 500", " spy ", "nasdaq", "dow jones", "stock market", " ipo ", "earnings", "interest rate", "bond yield", "fed rate"],
  },
  // ── Economy ───────────────────────────────────────────────────────────────
  {
    cat: "Economy",
    feeTypes: ["economy", "macro"],
    slugs: ["gdp", "inflation", "trade", "economy"],
    keywords: ["gdp", "inflation", "unemployment", " tariff", "trade war", "recession", " cpi ", "federal reserve", " imf ", " wto "],
  },
  // ── Politics ──────────────────────────────────────────────────────────────
  {
    cat: "Politics",
    feeTypes: ["politics", "political", "elections", "election_fees"],
    slugs: ["election", "president", "senate", "congress", "politics"],
    keywords: ["election", "president", "senator", "congress", "democrat", "republican", "trump", "biden", "harris", "governor", "prime minister", "parliament", "legislation", "impeach"],
  },
  // ── Culture ───────────────────────────────────────────────────────────────
  {
    cat: "Culture",
    feeTypes: ["mentions", "mentions_fees", "culture", "entertainment"],
    slugs: ["oscars", "grammys", "emmys", "mrbeast", "youtube", "pop-culture"],
    keywords: ["oscar", "grammy", "emmy", "celebrity", "mrbeast", "youtube", "tiktok", "netflix", "movie", " film ", "album", "music award"],
  },
];

function mapCategory(pm) {
  const feeType    = (pm.feeType ?? "").toLowerCase();
  const question   = ` ${(pm.question ?? pm.title ?? "").toLowerCase()} `;
  // Collect all series slugs from nested events
  const seriesSlugs = (pm.events ?? [])
    .flatMap(e => (e.series ?? []).map(s => (s.slug ?? "").toLowerCase()));

  for (const rule of CATEGORY_RULES) {
    // 1. feeType match
    if (rule.feeTypes.some(ft => feeType.includes(ft))) return rule.cat;
    // 2. series slug match
    if (seriesSlugs.some(slug => rule.slugs.some(s => slug.includes(s)))) return rule.cat;
    // 3. keyword match in question text
    if (rule.keywords.some(kw => question.includes(kw))) return rule.cat;
  }
  return "Other";
}

// ── Inline Market schema (mirrors src/models/Market.ts) ─────────────────────
const MarketSchema = new mongoose.Schema(
  {
    conditionId:      { type: String, required: true, unique: true, index: true },
    questionId:       { type: String, required: true, index: true },
    title:            { type: String, required: true },
    category:         { type: String, default: "Other" },
    outcomes:         { type: [String], default: ["Yes", "No"] },
    outcomeSlotCount: { type: Number, default: 2 },
    creator:          { type: String, required: true, lowercase: true, index: true },
    resolver:         { type: String, required: true, lowercase: true },
    resolved:         { type: Boolean, default: false },
    winner:           { type: String, default: null },
    winnerIndex:      { type: Number, default: null },
    txHash:           { type: String, required: true },
    blockNumber:      { type: Number, required: true },
    resolvedAt:       { type: Date,   default: null },
    resolvedBy:       { type: String, default: null, lowercase: true },
    resolveTxHash:    { type: String, default: null },
    // Extra metadata from Polymarket (ignored by the app model via strict mode)
    polymarketId:     { type: String, default: null },
    endDate:          { type: Date,   default: null },
  },
  { timestamps: true }
);

// ── Tag → keyword synonyms ───────────────────────────────────────────────────
// --tag=crypto will match any market whose title contains bitcoin, eth, etc.
const TAG_SYNONYMS = {
  crypto:    ["bitcoin", "btc", "ethereum", "eth", "solana", "sol", "crypto",
             "blockchain", "defi", "xrp", "ripple", "bnb", "doge", "dogecoin",
             "usdt", "stablecoin", "altcoin", "nft", "web3", "monero",
             "cardano", "ada", "polkadot", "chainlink", "avalanche", "avax",
             "abstract fdv", "fdv", "layer 2", "layer2", "hype up or down",
             "coin price", "crypto market", "on-chain"],
  politics:  ["election", "president", "senate", "congress", "vote", "democrat",
             "republican", "trump", "biden", "harris", "political", "party",
             "governor", "mayor", "legislation", "bill", "impeach", "zelensky",
             "macron", "putin", "parliament", "prime minister", "cabinet",
             "khamenei", "xi jinping", "modi", "referendum", "polling"],
  sports:    ["nfl", "nba", "mlb", "nhl", "soccer", "football", "basketball",
             "baseball", "tennis", "golf", "ufc", "mma", "champion", "world cup",
             "super bowl", "playoffs", "tournament", "match", "vs.",
             "set 1", "set 2", "o/u", "over/under", "moneyline", "alajuelense",
             "wimbledon", "french open", "us open", "grand slam", "formula 1", " f1 "],
  esports:   ["esports", "lol:", "league of legends", "dota", "cs2", "csgo",
             "valorant", "overwatch", "pubg", "fortnite", "gaming", "twitch",
             "streamer", "cblol", "lck", "lec", "lcs", "inhibitor", "baron nashor",
             "map 1", "map 2", "map 3", "total kills"],
  finance:   ["stock", "s&p", "spy", "nasdaq", "dow", "interest rate", "fed",
             "ipo", "earnings", "market cap", "bond", "yield", "aapl", "tsla",
             "msft", "nvda", "amzn", "up or down", "hit (high)", "hit (low)",
             "share price", "equity", "etf"],
  economy:   ["gdp", "unemployment", "inflation", "tariff", "trade war", "recession",
             "jobs", "cpi", "federal reserve", "interest rate", "economy",
             "imf", "wto", "trade deal", "sanctions"],
  culture:   ["oscar", "grammy", "emmy", "celebrity", "movie", "film", "music",
             "album", "song", "award", "artist", "mrbeast", "youtube", "tiktok",
             "netflix", "anime", "crunchyroll", "manga", "k-pop", "taylor swift",
             "beyonce", "kardashian", "sexiest", "people's choice", "billboard",
             "box office", "streaming", "viral", "social media", "influencer",
             "white house post", "tweet", "instagram"],
  // "other" is special — see buildKeywords() below
  other:     [],
};

// All known-category keywords flattened — used to EXCLUDE markets for --tag=other
const ALL_KNOWN_KEYWORDS = Object.entries(TAG_SYNONYMS)
  .filter(([k]) => k !== "other")
  .flatMap(([, v]) => v);

function buildKeywords(tag) {
  const lower = tag.toLowerCase();
  if (lower === "other") return null; // special: no include-keywords, use exclude logic
  // Check if it's a known synonym group
  for (const [key, synonyms] of Object.entries(TAG_SYNONYMS)) {
    if (key === lower) {
      return [lower, ...synonyms].filter((v, i, a) => a.indexOf(v) === i);
    }
    if (synonyms.includes(lower)) {
      return [lower, ...synonyms].filter((v, i, a) => a.indexOf(v) === i);
    }
  }
  // Otherwise treat the tag itself as a single keyword
  return [lower];
}


// The Gamma API does NOT support text-based tag filtering — tag_id expects a
// numeric ID. We fetch a larger batch and filter client-side by keyword instead.
// We always over-fetch so that markets already in MongoDB (skipped) don't reduce
// the final "created" count below the requested limit.
async function fetchPolymarketMarkets({ limit, tagKeyword }) {
  // Without a keyword: fetch limit + 50 as a skip buffer.
  // With a keyword:    fetch 10× limit (min 100, cap 300) to find enough matches.
  const fetchLimit = tagKeyword
    ? Math.min(Math.max(limit * 10, 100), 300)
    : Math.min(limit + 50, 300);

  const params = new URLSearchParams({
    active:    "true",
    closed:    "false",
    limit:     String(fetchLimit),
    order:     "volume",
    ascending: "false",
  });

  const url = `https://gamma-api.polymarket.com/markets?${params.toString()}`;
  console.log(`  Endpoint: ${url}`);

  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "predictiondapp-seeder/1.0" },
  });

  if (!res.ok) {
    throw new Error(`Polymarket API responded with ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  let markets = Array.isArray(data) ? data : (data.markets ?? []);

  // Client-side keyword filter on question text + event titles
  if (tagKeyword) {
    const keywords = buildKeywords(tagKeyword);

    if (keywords === null) {
      // --tag=other: keep markets that don't match ANY known category keyword
      markets = markets.filter(m => {
        const haystack = [
          m.question ?? m.title ?? "",
          ...(m.events ?? []).map(e => e.title ?? ""),
          m.feeType ?? "",
        ].join(" ").toLowerCase();
        return !ALL_KNOWN_KEYWORDS.some(kw => haystack.includes(kw));
      });
      console.log(`  "other" filter matched ${markets.length} market(s) from ${fetchLimit} fetched`);
    } else {
      console.log(`  Matching keywords: ${keywords.slice(0, 8).join(", ")}${keywords.length > 8 ? "…" : ""}`);
      markets = markets.filter(m => {
        const haystack = [
          m.question ?? m.title ?? "",
          ...(m.events ?? []).map(e => e.title ?? ""),
          m.feeType ?? "",
        ].join(" ").toLowerCase();
        return keywords.some(kw => haystack.includes(kw));
      });
      console.log(`  Keyword filter matched ${markets.length} market(s) from ${fetchLimit} fetched`);
    }
  }

  // Do NOT slice here — the main loop will stop once `limit` markets are created.
  return markets;
}

// ── CLI argument helpers ─────────────────────────────────────────────────────
function getArg(name, defaultValue = null) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : defaultValue;
}
function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const PRIVATE_KEY  = process.env.ADMIN_PRIVATE_KEY;
  const MONGODB_URI  = process.env.MONGODB_URI;
  const RPC_URL      = process.env.RPC_URL ?? "https://sepolia.base.org";

  const limit        = parseInt(getArg("limit", "5"), 10);
  const tagKeyword   = getArg("tag");
  const filterCat    = getArg("category");
  const isDryRun     = hasFlag("dry-run");

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!MONGODB_URI) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
  }
  if (!isDryRun && !PRIVATE_KEY) {
    console.error("❌  ADMIN_PRIVATE_KEY is not set in .env (required unless --dry-run)");
    process.exit(1);
  }

  console.log("\n🔮  Polymarket → PredictionDapp Market Seeder");
  console.log(`    Limit    : ${limit}`);
  console.log(`    Tag      : ${tagKeyword ?? "(all)"}`);
  console.log(`    Category : ${filterCat ?? "(all)"}`);
  console.log(`    Dry run  : ${isDryRun}\n`);

  // ── MongoDB connection ─────────────────────────────────────────────────────
  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected to MongoDB");

  // Use existing model if already registered (avoids OverwriteModelError)
  const Market = mongoose.models.Market ?? mongoose.model("Market", MarketSchema);

  // ── Viem clients ───────────────────────────────────────────────────────────
  let account, publicClient, walletClient;

  if (!isDryRun) {
    const pk = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
    account      = privateKeyToAccount(pk);
    publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });
    walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC_URL) });
    console.log(`🔑  Signing wallet: ${account.address}\n`);
  }

  // ── Fetch from Polymarket ──────────────────────────────────────────────────
  console.log("📡  Fetching markets from Polymarket...");
  let polymarkets;
  try {
    polymarkets = await fetchPolymarketMarkets({ limit, tagKeyword });
  } catch (err) {
    console.error(`❌  Failed to fetch from Polymarket: ${err.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`📦  Fetched ${polymarkets.length} markets\n`);

  // ── Process each market ────────────────────────────────────────────────────
  let created = 0, skipped = 0, failed = 0;

  for (let i = 0; i < polymarkets.length; i++) {
    const pm = polymarkets[i];
    const title = (pm.question ?? pm.title ?? "").trim();

    if (!title) {
      console.log(`[${i + 1}/${polymarkets.length}] ⏭️  Skipping — no question text`);
      skipped++;
      continue;
    }

    // Parse outcomes
    let outcomes = ["Yes", "No"];
    try {
      const raw = typeof pm.outcomes === "string" ? JSON.parse(pm.outcomes) : pm.outcomes;
      if (Array.isArray(raw) && raw.length >= 2) {
        outcomes = raw.map(o => (typeof o === "string" ? o : o.title ?? String(o)));
      }
    } catch { /* keep default */ }

    const category = mapCategory(pm);

    // Optional category filter
    if (filterCat && category.toLowerCase() !== filterCat.toLowerCase()) {
      console.log(`[${i + 1}/${polymarkets.length}] ⏭️  Skipping — category "${category}" ≠ "${filterCat}"`);
      skipped++;
      continue;
    }

    // Derive IDs
    const questionId = keccak256(encodePacked(["string"], [title]));
    const conditionId = keccak256(
      encodePacked(
        ["address", "bytes32", "uint256"],
        [CONTRACT_ADDRESSES.SIMPLE_RESOLVER, questionId, BigInt(outcomes.length)]
      )
    );

    // End date
    let endDate = null;
    try {
      if (pm.endDate ?? pm.endTime) endDate = new Date(pm.endDate ?? pm.endTime);
    } catch { /* ignore */ }

    console.log(`\n[${i + 1}/${polymarkets.length}] 📝  "${title.slice(0, 80)}${title.length > 80 ? "…" : ""}"`);
    console.log(`    Category : ${category}`);
    console.log(`    Outcomes : ${outcomes.join(" / ")}`);
    console.log(`    Ends     : ${endDate ? endDate.toISOString().slice(0, 10) : "unknown"}`);
    console.log(`    conditionId: ${conditionId}`);

    // Check for existing market
    const existing = await Market.findOne({ conditionId }).lean();
    if (existing) {
      console.log(`    ⏭️  Already exists — skipping`);
      skipped++;
      continue;
    }

    // Stop as soon as we've created (or dry-run logged) the requested number
    if (created >= limit) {
      console.log(`\n    ✋  Reached limit of ${limit} — stopping`);
      break;
    }

    if (isDryRun) {
      console.log(`    [DRY RUN] Would create this market`);
      created++;
      continue;
    }

    // ── On-chain: prepareCondition ─────────────────────────────────────────
    try {
      console.log(`    ⏳  Sending prepareCondition tx...`);

      const hash = await walletClient.writeContract({
        address:      CONTRACT_ADDRESSES.CONDITIONAL_TOKEN,
        abi:          PREPARE_CONDITION_ABI,
        functionName: "prepareCondition",
        args: [
          CONTRACT_ADDRESSES.SIMPLE_RESOLVER,
          questionId,
          BigInt(outcomes.length),
        ],
      });

      console.log(`    ⏳  TX hash: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`    ✅  Confirmed at block ${receipt.blockNumber}`);

      // ── Save to MongoDB ─────────────────────────────────────────────────
      await Market.create({
        conditionId,
        questionId,
        title,
        category,
        outcomes,
        outcomeSlotCount: outcomes.length,
        creator:          account.address.toLowerCase(),
        resolver:         CONTRACT_ADDRESSES.SIMPLE_RESOLVER.toLowerCase(),
        txHash:           hash,
        blockNumber:      Number(receipt.blockNumber),
        polymarketId:     pm.id ?? pm.conditionId ?? null,
        endDate,
      });

      console.log(`    💾  Saved to MongoDB`);
      created++;

      // Brief pause to avoid nonce collisions on rapid-fire txs
      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      const msg = err?.shortMessage ?? err?.message ?? String(err);
      console.error(`    ❌  Failed: ${msg.slice(0, 150)}`);
      failed++;
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────");
  console.log(`✅  Created : ${created}`);
  console.log(`⏭️   Skipped : ${skipped}`);
  console.log(`❌  Failed  : ${failed}`);
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
