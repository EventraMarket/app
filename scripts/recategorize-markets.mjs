/**
 * scripts/recategorize-markets.mjs
 *
 * Updates the `category` field of every market in MongoDB whose category is
 * "Other" (or any category) by re-detecting it from the question title using
 * keyword rules.  Run this once after updating the seeder's category logic.
 *
 * Usage:
 *   node scripts/recategorize-markets.mjs
 *   node scripts/recategorize-markets.mjs --dry-run     (preview only, no DB writes)
 *   node scripts/recategorize-markets.mjs --all         (re-check every market, not just "Other")
 */

import mongoose from "mongoose";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// ── Keyword category rules (title-only version) ──────────────────────────────
const CATEGORY_RULES = [
  {
    cat: "Esports",
    keywords: ["esports", "lol:", "league of legends", "dota", "cs2", "valorant",
               "overwatch", "cblol", "lck", "lec", "lcs", "rlcs", "rocket league",
               "pubg", "fortnite", "apex legends", "inhibitor", "baron nashor",
               "game 1:", "game 2:", "game 3:", "map 1:", "map 2:", "map 3:",
               "odd/even total kills", "total kills"],
  },
  {
    cat: "Sports",
    keywords: ["nfl", "nba", "mlb", "nhl", " ufc ", "mma ", "super bowl",
               "world cup", "champions league", "premier league", "la liga",
               "bundesliga", "serie a", " f1 ", "formula 1", "wimbledon",
               "us open", "french open", "australian open", "grand slam",
               " set 1 ", " set 2 ", " set 3 ", "o/u ", "over/under",
               "moneyline", "match winner", "vs.", " vs ", " fc ", " sc ",
               " afc ", " nfc ", " al ", " nl "],
  },
  {
    cat: "Crypto",
    keywords: ["bitcoin", " btc ", "ethereum", " eth ", "solana", " sol ",
               " xrp", "ripple", " bnb", "dogecoin", " doge", "crypto",
               "blockchain", "defi", " nft", "altcoin", "stablecoin",
               "monero", " xmr", "cardano", " ada ", "polkadot", " dot ",
               "chainlink", " link ", "abstract fdv", "token launch", "fdv"],
  },
  {
    cat: "Finance",
    keywords: ["s&p 500", " spy ", "nasdaq", "dow jones", "stock market",
               " ipo ", "earnings", "interest rate", "bond yield", "fed rate",
               "apple (aapl)", " aapl", " tsla", " msft", " nvda", " amzn",
               "up or down", "hit (high)", "hit (low)", "reach $"],
  },
  {
    cat: "Economy",
    keywords: ["gdp", "inflation", "unemployment", " tariff", "trade war",
               "recession", " cpi ", "federal reserve", " imf ", " wto ",
               "interest rate hike", "rate cut"],
  },
  {
    cat: "Politics",
    keywords: ["election", "president", "senator", "congress", "democrat",
               "republican", "trump", "biden", "harris", "governor",
               "prime minister", "parliament", "legislation", "impeach",
               "vote", "ballot", "polling", "approve", "approval rating",
               "khamenei", "zelensky", "macron", "putin", "xi jinping"],
  },
  {
    cat: "Culture",
    keywords: ["oscar", "grammy", "emmy", "celebrity", "mrbeast", "youtube",
               "tiktok", "netflix", "movie", " film ", "music award",
               "anime", "crunchyroll", "manga", "gachiakuta", "streamer"],
  },
];

function detectCategory(title) {
  const haystack = ` ${title.toLowerCase()} `;
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => haystack.includes(kw))) return rule.cat;
  }
  return null; // keep existing if no match
}

// ── Inline Market schema ─────────────────────────────────────────────────────
const MarketSchema = new mongoose.Schema(
  {
    conditionId: { type: String, required: true, unique: true },
    title:       { type: String, required: true },
    category:    { type: String, default: "Other" },
  },
  { strict: false, timestamps: true }
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function hasFlag(name) { return process.argv.includes(`--${name}`); }

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const isDryRun  = hasFlag("dry-run");
  const doAll     = hasFlag("all");

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) { console.error("❌  MONGODB_URI not set"); process.exit(1); }

  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected to MongoDB");

  const Market = mongoose.models.Market ?? mongoose.model("Market", MarketSchema);

  // Fetch target markets
  const filter = doAll ? {} : { category: "Other" };
  const markets = await Market.find(filter).select("conditionId title category").lean();
  console.log(`\n📦  Found ${markets.length} market(s) to check${doAll ? "" : " with category=Other"}\n`);

  let updated = 0, unchanged = 0, noMatch = 0;

  for (const m of markets) {
    const detected = detectCategory(m.title);
    const current  = m.category ?? "Other";

    if (!detected || detected === current) {
      unchanged++;
      continue;
    }

    console.log(`  "${m.title.slice(0, 70)}${m.title.length > 70 ? "…" : ""}"`);
    console.log(`    ${current} → ${detected}${isDryRun ? "  [DRY RUN]" : ""}`);

    if (!isDryRun) {
      await Market.updateOne({ _id: m._id }, { $set: { category: detected } });
    }
    updated++;
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`✅  Updated   : ${updated}`);
  console.log(`⏭️   Unchanged : ${unchanged}`);
  console.log(`❓  No match  : ${noMatch}`);
  if (isDryRun) console.log(`\n⚠️   Dry run — no changes written to DB`);
  console.log(`─────────────────────────────────────────\n`);

  await mongoose.disconnect();
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
