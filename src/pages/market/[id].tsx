
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import TopNavbar from "@/components/TopNavbar";
import { useWallet } from "@/context/WalletContext";
import { useWalletClient, usePublicClient, useAccount, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { getContracts, USDC_ABI, CONDITIONAL_TOKEN_ABI, FPMM_ABI } from "@/lib/contracts";
import { getChainName } from "@/lib/useMarkets";
import type { TransformedMarket as Market } from "@/lib/useMarkets";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

function SparkChart({ yesPercent }: { yesPercent: number }) {
  const data = useMemo(() => {
    const pts: number[] = [50];
    for (let i = 0; i < 28; i++) {
      const last = pts[pts.length - 1];
      const delta = (Math.random() - 0.48) * 5;
      pts.push(Math.max(3, Math.min(97, last + delta)));
    }
    pts.push(yesPercent);
    return pts;
  }, [yesPercent]);

  const W = 600,
    H = 120,
    P = 8;
  const mn = Math.min(...data),
    mx = Math.max(...data),
    rng = mx - mn || 1;
  const pts = data.map((v, i) => ({
    x: P + (i / (data.length - 1)) * (W - 2 * P),
    y: H - P - ((v - mn) / rng) * (H - 2 * P),
  }));
  const line = pts
    .map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1))
    .join(" ");
  const area =
    line +
    " L" +
    pts[pts.length - 1].x +
    "," +
    H +
    " L" +
    pts[0].x +
    "," +
    H +
    " Z";

  return (
    <svg viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none" className="w-full h-28 sm:h-36">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3B21A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F3B21A" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGrad)" />
      <path
        d={line}
        fill="none"
        stroke="#F3B21A"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill="#F3B21A" />
    </svg>
  );
}

export default function MarketDetailPage() {
  const router = useRouter();
  const { id, outcome: outcomeQuery, chainId: chainIdQuery } = router.query;
  const marketId = typeof id === "string" ? id : "";
  const requiredChainId = chainIdQuery ? parseInt(chainIdQuery as string, 10) : 42220;

  const { address, isConnected, connecting, connect } = useWallet();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const contracts = getContracts(connectedChainId);

  const [chainMismatch, setChainMismatch] = useState(false);
  const [chainSwitching, setChainSwitching] = useState(false);

  const [market, setMarket] = useState<Market | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [userOutcomeStatus, setUserOutcomeStatus] = useState<
    "winner" | "loser" | "none" | "checking" | null
  >(null);

  // Check for chain mismatch
  useEffect(() => {
    if (isConnected && connectedChainId && connectedChainId !== requiredChainId) {
      setChainMismatch(true);
    } else {
      setChainMismatch(false);
    }
  }, [isConnected, connectedChainId, requiredChainId]);

  const handleSwitchChain = async () => {
    try {
      setChainSwitching(true);
      await switchChain({ chainId: requiredChainId });
    } catch (err) {
      console.error("Failed to switch chain:", err);
    } finally {
      setChainSwitching(false);
    }
  };

  // Fetch market from API
  useEffect(() => {
    if (!marketId) return;
    let cancelled = false;

    async function fetchMarket() {
      setLoadingMarket(true);
      try {
        const res = await fetch(`/api/markets?conditionId=${encodeURIComponent(marketId)}`);
        if (res.ok) {
          const json = await res.json();
          const list = json.markets ?? json.games ?? [];
          const found = list[0] ?? null;
          if (found && !cancelled) {
            setMarket({
              gameId: found.conditionId ?? found.gameId,
              title: found.title,
              conditionId: found.conditionId as `0x${string}`,
              questionId: found.questionId as `0x${string}`,
              startsAt: String(Math.floor(new Date(found.createdAt).getTime() / 1000)),
              sport: { name: found.category ?? "Prediction" },
              league: { name: getChainName(found.chainId) },
              participants: (found.outcomes ?? ["Yes", "No"]).map((o: string) => ({
                name: o,
              })),
              category: found.category,
              outcomes: found.outcomes,
              resolved: found.resolved,
              chainId: found.chainId,
              fpmmAddress: found.fpmmAddress,
            });
            setLoadingMarket(false);
            return;
          }
        }
        if (!cancelled) setLoadingMarket(false);
      } catch (err) {
        console.error("[id].tsx fetchMarket error:", err);
        if (!cancelled) setLoadingMarket(false);
      }
    }

    fetchMarket();
    return () => {
      cancelled = true;
    };
  }, [marketId]);

  // Trading state
  const outcomes = market?.outcomes ?? market?.participants.map((p) => p.name) ?? ["Yes", "No"];
  const fpmmAddress = market?.fpmmAddress;

  const [tradeTab, setTradeTab] = useState<"buy" | "sell">("buy");
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState("10");
  const [betLoading, setBetLoading] = useState(false);
  const [betSuccess, setBetSuccess] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);

  const [outcomeVolumes, setOutcomeVolumes] = useState<Record<string, number>>({});
  const [totalTxVolume, setTotalTxVolume] = useState(0);
  const [traderCount, setTraderCount] = useState(0);

  const fetchOutcomeVolumes = useCallback(
    async (conditionId: string) => {
      try {
        const res = await fetch(`/api/transactions?conditionId=${conditionId}&limit=500`);
        if (!res.ok) return;
        const data = await res.json();
        const txs: { amount: string; wallet: string; outcomeIndex?: number }[] =
          data.transactions ?? [];
        const volByOutcome: Record<string, number> = {};
        let total = 0;
        const wallets = new Set<string>();
        txs.forEach((tx) => {
          const v = parseFloat(tx.amount) || 0;
          total += v;
          if (tx.wallet) wallets.add(tx.wallet);
          if (tx.outcomeIndex != null && outcomes[tx.outcomeIndex] != null) {
            const key = outcomes[tx.outcomeIndex];
            volByOutcome[key] = (volByOutcome[key] ?? 0) + v;
          }
        });
        const hasRealData = Object.keys(volByOutcome).length > 0;
        if (!hasRealData) {
          outcomes.forEach((o) => {
            volByOutcome[o] = total / outcomes.length;
          });
        }
        setOutcomeVolumes(volByOutcome);
        setTotalTxVolume(total);
        setTraderCount(wallets.size);
      } catch {
        // silently fail
      }
    },
    [outcomes]
  );

  useEffect(() => {
    if (market?.conditionId) fetchOutcomeVolumes(market.conditionId);
  }, [market, fetchOutcomeVolumes, betSuccess]);

  // Fetch USDC balance
  useEffect(() => {
    if (!publicClient || !address) return;
    publicClient
      .readContract({
        address: contracts.USDC as `0x${string}`,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address],
      })
      .then((bal) => setUsdcBalance(Number(formatUnits(bal as bigint, 6))))
      .catch(() => setUsdcBalance(0));
  }, [publicClient, address, betSuccess, mintSuccess]);

  // Check user outcome status when market is resolved
  useEffect(() => {
    if (!market?.resolved || !market.conditionId || !publicClient) {
      setUserOutcomeStatus(null);
      return;
    }
    if (!address) {
      setUserOutcomeStatus(null);
      return;
    }

    let cancelled = false;
    setUserOutcomeStatus("checking");

    (async () => {
      try {
        const conditionId = market.conditionId as `0x${string}`;
        const parentCollectionId =
          "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
        const indexSets = [BigInt(1), BigInt(2)];

        const payouts = await Promise.all(
          indexSets.map((_, i) =>
            publicClient.readContract({
              address: contracts.CONDITIONAL_TOKEN as `0x${string}`,
              abi: CONDITIONAL_TOKEN_ABI,
              functionName: "payoutNumerators",
              args: [conditionId, BigInt(i)],
            })
          )
        );

        const collectionIds = await Promise.all(
          indexSets.map((indexSet) =>
            publicClient.readContract({
              address: contracts.CONDITIONAL_TOKEN as `0x${string}`,
              abi: CONDITIONAL_TOKEN_ABI,
              functionName: "getCollectionId",
              args: [parentCollectionId, conditionId, indexSet],
            })
          )
        );
        const positionIds = await Promise.all(
          collectionIds.map((collectionId) =>
            publicClient.readContract({
              address: contracts.CONDITIONAL_TOKEN as `0x${string}`,
              abi: CONDITIONAL_TOKEN_ABI,
              functionName: "getPositionId",
              args: [contracts.USDC as `0x${string}`, collectionId as `0x${string}`],
            })
          )
        );
        const balances = await Promise.all(
          positionIds.map((positionId) =>
            publicClient.readContract({
              address: contracts.CONDITIONAL_TOKEN as `0x${string}`,
              abi: CONDITIONAL_TOKEN_ABI,
              functionName: "balanceOf",
              args: [address, positionId as bigint],
            })
          )
        );

        if (cancelled) return;

        const heldAny = balances.some((b) => (b as bigint) > BigInt(0));
        if (!heldAny) {
          setUserOutcomeStatus("none");
          return;
        }

        const won = balances.some(
          (b, i) => (b as bigint) > BigInt(0) && (payouts[i] as bigint) > BigInt(0)
        );
        setUserOutcomeStatus(won ? "winner" : "loser");
      } catch (err) {
        console.error("Failed to determine claim status:", err);
        if (!cancelled) setUserOutcomeStatus(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [market?.resolved, market?.conditionId, publicClient, address, contracts]);

  async function handleMint() {
    if (!walletClient || !address) return;
    setMintLoading(true);
    setMintSuccess(false);
    try {
      await walletClient.writeContract({
        address: contracts.USDC as `0x${string}`,
        abi: USDC_ABI,
        functionName: "faucet",
        args: [address as `0x${string}`, parseUnits("1000", 6)],
      });
      setMintSuccess(true);
    } catch {
      // ignore
    } finally {
      setMintLoading(false);
    }
  }

  async function handleClaimWinnings() {
    if (!walletClient || !market?.conditionId || !publicClient) return;
    setClaimLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contracts.CONDITIONAL_TOKEN as `0x${string}`,
        abi: CONDITIONAL_TOKEN_ABI,
        functionName: "redeemPositions",
        args: [
          contracts.USDC as `0x${string}`,
          "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
          market.conditionId as `0x${string}`,
          [BigInt(1), BigInt(2)],
        ],
      });
    const reciept =   await publicClient.waitForTransactionReceipt({ hash });
     console.log("Redemption transaction receipt:", reciept);
      setUserOutcomeStatus("none");
      alert("Winnings claimed successfully!");
    } catch (err) {
      console.error("Redemption failed:", err);
      alert("Redemption failed. See console for details.");
    } finally {
      setClaimLoading(false);
    }
  }

  // Pre-select outcome from URL param
  useEffect(() => {
    if (!market || typeof outcomeQuery !== "string") return;
    const q = outcomeQuery.toLowerCase();
    const match = outcomes.find((o) => o.toLowerCase() === q || o.toLowerCase().startsWith(q));
    if (match) setSelected(match);
  }, [outcomeQuery, market, outcomes]);

  const yesPercent = useMemo(() => {
    const total = Object.values(outcomeVolumes).reduce((a, b) => a + b, 0);
    if (total === 0) return 50;
    return Math.round(((outcomeVolumes[outcomes[0]] ?? 0) / total) * 100);
  }, [outcomeVolumes, outcomes]);

  const noPercent = 100 - yesPercent;
  const selectedPct = selected === outcomes[0] ? yesPercent : noPercent;
  const estimatedShares =
    parseFloat(amount || "0") > 0
      ? (parseFloat(amount) / (selectedPct / 100)).toFixed(2)
      : "0.00";

  // ── BUY via FPMM ──────────────────────────────────────────────────────────
  async function handleBuy() {
    if (!walletClient || !publicClient || !address || !selected || !market || !fpmmAddress) {
      setBetError("Missing required data for trading.");
      return;
    }

    const outcomeIndex = outcomes.indexOf(selected);
    const amountParsed = parseUnits(amount, 6);

    setBetLoading(true);
    setBetError(null);
    setBetSuccess(false);

    try {
      // 1. Approve USDC for FPMM
      await walletClient.writeContract({
        address: contracts.USDC as `0x${string}`,
        abi: USDC_ABI,
        functionName: "approve",
        args: [fpmmAddress as `0x${string}`, amountParsed],
      });

      // 2. Estimate outcome tokens
      const expectedOutcomeTokens = await publicClient.readContract({
        address: fpmmAddress as `0x${string}`,
        abi: FPMM_ABI,
        functionName: "calcBuyAmount",
        args: [amountParsed, BigInt(outcomeIndex)],
      });
      // 0.5% slippage tolerance
      const minOutcomeTokens = (BigInt(expectedOutcomeTokens) * 995n) / 1000n;

      // 3. Buy
      const txHash = await walletClient.writeContract({
        address: fpmmAddress as `0x${string}`,
        abi: FPMM_ABI,
        functionName: "buy",
        args: [amountParsed, BigInt(outcomeIndex), minOutcomeTokens],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      // 4. Record transaction
      const chainId = await walletClient.getChainId();
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash,
          type: "fpmm_buy",
          wallet: address,
          conditionId: market.conditionId,
          questionId: market.questionId ?? null,
          amount,
          amountRaw: amountParsed.toString(),
          outcomeIndex,
          blockNumber: Number(receipt.blockNumber),
          timestamp: new Date().toISOString(),
          chainId,
          fpmm: fpmmAddress,
        }),
      });

      setBetSuccess(true);
      setAmount("10");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setBetError(msg.length > 130 ? msg.slice(0, 130) + "..." : msg);
    } finally {
      setBetLoading(false);
    }
  }

  // ── SELL via FPMM ─────────────────────────────────────────────────────────
  async function handleSell() {
    if (!walletClient || !publicClient || !address || !selected || !market || !fpmmAddress) {
      setBetError("Missing required data for trading.");
      return;
    }

    const outcomeIndex = outcomes.indexOf(selected);
    const amountParsed = parseUnits(amount, 6);

    setBetLoading(true);
    setBetError(null);
    setBetSuccess(false);

    try {
      // 1. Estimate how many outcome tokens to sell
      const expectedSellAmount = await publicClient.readContract({
        address: fpmmAddress as `0x${string}`,
        abi: FPMM_ABI,
        functionName: "calcSellAmount",
        args: [amountParsed, BigInt(outcomeIndex)],
      });
      // Allow up to 0.5% more tokens to sell
      const maxOutcomeTokensToSell = (BigInt(expectedSellAmount) * 1005n) / 1000n;

      // 2. Sell
      const txHash = await walletClient.writeContract({
        address: fpmmAddress as `0x${string}`,
        abi: FPMM_ABI,
        functionName: "sell",
        args: [amountParsed, BigInt(outcomeIndex), maxOutcomeTokensToSell],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      // 3. Record transaction
      const chainId = await walletClient.getChainId();
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash,
          type: "fpmm_sell",
          wallet: address,
          conditionId: market.conditionId,
          questionId: market.questionId ?? null,
          amount,
          amountRaw: amountParsed.toString(),
          outcomeIndex,
          blockNumber: Number(receipt.blockNumber),
          timestamp: new Date().toISOString(),
          chainId,
          fpmm: fpmmAddress,
        }),
      });

      setBetSuccess(true);
      setAmount("10");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setBetError(msg.length > 130 ? msg.slice(0, 130) + "..." : msg);
    } finally {
      setBetLoading(false);
    }
  }

  if (loadingMarket) {
    return (
      <div className={geistSans.className + " min-h-screen"}>
        <TopNavbar />
        <main className="pt-28 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F3B21A] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!market) {
    return (
      <div className={geistSans.className + " min-h-screen"}>
        <TopNavbar />
        <main className="pt-28 flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-2xl font-bold text-[#F3B21A]">Market Not Found</p>
          <p className="text-sm text-zinc-400 max-w-sm">
            No market exists for ID: <code className="text-xs bg-zinc-800 px-2 py-1 rounded">{marketId}</code>
          </p>
          <p className="text-xs text-zinc-600">
            Make sure the URL uses the market&apos;s <strong>conditionId</strong> (0x… hash).
          </p>
          <a
            href="/markets"
            className="mt-2 px-5 py-2.5 bg-[#F3B21A] text-black font-bold rounded-xl hover:bg-[#D9A650] transition-all text-sm"
          >
            ← Back to Markets
          </a>
        </main>
      </div>
    );
  }

  const categoryLabel = market.category ?? market.sport.name;

  return (
    <div className={geistSans.className + " min-h-screen"}>
      <TopNavbar />

      <main className="pt-20 md:pt-24 pb-20 px-3 sm:px-4 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#D9A650]/70 mb-6">
          <Link href="/markets" className="hover:text-[#F3B21A] transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-[#D9A650] truncate max-w-[55vw]">{market.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: market info + chart */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-black rounded-2xl border border-[#D9A650]/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#F3B21A]/15 border border-[#F3B21A]/30 text-[#F3B21A]">
                  {categoryLabel}
                </span>
                {market.resolved ? (
                  userOutcomeStatus === "winner" ? (
                    <button
                      onClick={handleClaimWinnings}
                      disabled={claimLoading}
                      className="w-full py-3.5 mt-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      {claimLoading ? "Claiming..." : "Claim Winnings"}
                    </button>
                  ) : userOutcomeStatus === "loser" ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                      Resolved — your prediction did not win
                    </span>
                  ) : userOutcomeStatus === "checking" ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#D9A650]/10 border border-[#D9A650]/20 text-[#D9A650]/70">
                      Checking your position...
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                      ✓ Resolved
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#F3B21A]/10 border border-[#F3B21A]/20 text-[#F3B21A]">
                    Active
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-5">
                {market.title}
              </h1>

              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-[#F3B21A]">{yesPercent}%</span>
                <span className="text-[#D9A650]/60 mb-1 text-sm">chance</span>
                <span className="text-green-400 text-xs mb-1.5">Yes</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#D9A650]/15 overflow-hidden mb-6">
                <div className="h-full rounded-full bg-[#F3B21A]" style={{ width: yesPercent + "%" }} />
              </div>

              <div className="bg-[#070707] rounded-xl p-3 sm:p-4 border border-[#D9A650]/20">
                <div className="flex items-center justify-between text-xs text-[#D9A650]/50 mb-2">
                  <span>Price history (30 days)</span>
                  <span className="text-[#F3B21A] font-medium">Yes {yesPercent}c</span>
                </div>
                <SparkChart yesPercent={yesPercent} />
                <div className="flex justify-between text-[10px] text-[#D9A650]/30 mt-1">
                  <span>30d ago</span>
                  <span>Now</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Volume",
                  value:
                    totalTxVolume > 0
                      ? `$${totalTxVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "—",
                },
                {
                  label: "Liquidity",
                  value:
                    totalTxVolume > 0
                      ? `$${Math.round(totalTxVolume * 0.35).toLocaleString()}`
                      : "—",
                },
                {
                  label: "Traders",
                  value: traderCount > 0 ? String(traderCount) : "—",
                },
              ].map((s) => (
                <div key={s.label} className="bg-black rounded-xl border border-[#D9A650]/30 p-4 text-center">
                  <p className="text-[10px] text-[#D9A650]/50 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Market info */}
            <div className="bg-black rounded-2xl border border-[#D9A650]/40 p-5">
              <h2 className="text-xs font-semibold text-[#D9A650]/60 uppercase tracking-widest mb-4">
                Market Info
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#D9A650]/50">Network</span>
                  <span className="text-white">{market.league?.name ?? getChainName(market.chainId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D9A650]/50">Category</span>
                  <span className="text-white">{categoryLabel}</span>
                </div>
                {fpmmAddress && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#D9A650]/50">FPMM</span>
                    <span className="text-white font-mono text-xs truncate max-w-[160px]">
                      {fpmmAddress}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#D9A650]/50">Condition ID</span>
                  <span className="text-white font-mono text-xs truncate max-w-[160px]">
                    {market.conditionId ?? "Demo"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D9A650]/50">Status</span>
                  <span className={market.resolved ? "text-green-400" : "text-[#F3B21A]"}>
                    {market.resolved ? "Resolved" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: trading panel */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl border border-[#D9A650]/40 p-5 sm:p-6 lg:sticky lg:top-24">
              {/* Buy / Sell tabs */}
              <div className="flex bg-[#D9A650]/10 rounded-xl p-1 mb-5">
                {(["buy", "sell"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTradeTab(tab)}
                    className={
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize " +
                      (tradeTab === tab
                        ? "bg-[#F3B21A] text-black shadow"
                        : "text-[#D9A650]/60 hover:text-[#F3B21A]")
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* FPMM status warning */}
              {!fpmmAddress && !market.resolved && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-xs text-yellow-400">
                    This market does not have a trading pool (FPMM) yet. Please wait for the admin to deploy it.
                  </p>
                </div>
              )}

              {/* Outcome buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {outcomes.map((outcome, idx) => {
                  const pct = idx === 0 ? yesPercent : noPercent;
                  const isSelected = selected === outcome;
                  const isFirst = idx === 0;
                  return (
                    <button
                      key={outcome}
                      onClick={() => setSelected(isSelected ? null : outcome)}
                      className={
                        "py-3 px-3 rounded-xl border-2 font-semibold text-sm transition-all flex flex-col items-center gap-0.5 " +
                        (isSelected
                          ? isFirst
                            ? "border-green-400 bg-green-500/15 text-white"
                            : "border-red-400 bg-red-500/15 text-white"
                          : "border-[#D9A650]/25 bg-[#D9A650]/5 text-[#D9A650]/70 hover:border-[#D9A650]/50 hover:text-white")
                      }
                    >
                      <span className="text-base font-bold">{outcome}</span>
                      <span
                        className={
                          "text-xs font-normal " +
                          (isSelected
                            ? isFirst
                              ? "text-green-300"
                              : "text-red-300"
                            : "text-[#D9A650]/40")
                        }
                      >
                        {pct}c
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Amount input */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#D9A650]/60">Amount</label>
                  <span className="text-xs text-[#D9A650]/40">
                    Balance:{" "}
                    <span
                      className={
                        usdcBalance < parseFloat(amount || "0")
                          ? "text-red-400 font-semibold"
                          : "text-white font-semibold"
                      }
                    >
                      {usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
                    </span>
                  </span>
                </div>
                <div className="flex items-center bg-[#0a0a0a] border border-[#D9A650]/30 rounded-xl px-4 py-3 focus-within:border-[#F3B21A] transition-colors">
                  <span className="text-[#D9A650]/40 text-base mr-2">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-transparent text-white text-xl font-bold focus:outline-none"
                    min="1"
                    step="1"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[1, 5, 10, 100].map((q) => (
                    <button
                      key={q}
                      onClick={() =>
                        setAmount((prev) => String(Math.max(0, parseFloat(prev || "0") + q)))
                      }
                      className="flex-1 py-1.5 text-xs bg-black border border-[#D9A650]/20 rounded-lg text-[#D9A650]/60 hover:bg-[#D9A650]/15 hover:text-[#F3B21A] hover:border-[#D9A650]/40 transition-all"
                    >
                      +${q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout estimate */}
              {selected && parseFloat(amount || "0") > 0 && (
                <div className="mb-4 p-3.5 bg-[#D9A650]/5 border border-[#D9A650]/20 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#D9A650]/50">Avg price</span>
                    <span className="text-white">{selectedPct}c</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#D9A650]/50">Est. shares</span>
                    <span className="text-white font-semibold">{estimatedShares}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-[#D9A650]/15 pt-2">
                    <span className="text-[#D9A650]/50">Max payout</span>
                    <span className="text-green-400 font-bold">${estimatedShares}</span>
                  </div>
                </div>
              )}

              {betError && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-xs text-red-400">{betError}</p>
                </div>
              )}
              {betSuccess && (
                <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-xs text-green-400">
                    {tradeTab === "buy"
                      ? `Trade successful! You received ${selected} outcome tokens.`
                      : `Trade successful! You sold ${selected} outcome tokens.`}
                  </p>
                </div>
              )}

              {/* Low balance faucet
              {isConnected && usdcBalance < parseFloat(amount || "0") && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-xs text-red-400 mb-2">
                    Insufficient USDC balance ({usdcBalance.toFixed(2)} USDC). Get free testnet tokens:
                  </p>
                  {mintSuccess ? (
                    <p className="text-xs text-green-400">1000 USDC minted! Balance will update shortly.</p>
                  ) : (
                    <button
                      onClick={handleMint}
                      disabled={mintLoading}
                      className="w-full py-2 text-xs bg-[#D9A650]/15 border border-[#D9A650]/40 text-[#F3B21A] font-semibold rounded-lg hover:bg-[#D9A650]/25 transition-all disabled:opacity-50"
                    >
                      {mintLoading ? "Minting..." : "Get 1000 Test USDC"}
                    </button>
                  )}
                </div>
              )} */}

              {/* Chain mismatch warning */}
              {chainMismatch && (
                <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-xs text-yellow-400 mb-2">
                    Wrong network. Please switch to the correct chain to trade.
                  </p>
                  <button
                    onClick={handleSwitchChain}
                    disabled={chainSwitching}
                    className="w-full py-2 text-xs bg-[#F3B21A] text-black font-bold rounded-lg hover:bg-[#D9A650] transition-all disabled:opacity-50"
                  >
                    {chainSwitching ? "Switching..." : `Switch to ${getChainName(requiredChainId)}`}
                  </button>
                </div>
              )}

              {/* CTA */}
              {!isConnected ? (
                <button
                  onClick={connect}
                  disabled={connecting}
                  className="w-full py-3.5 bg-[#F3B21A] text-black font-bold rounded-xl hover:bg-[#D9A650] transition-all disabled:opacity-50 text-sm"
                >
                  {connecting ? "Connecting..." : "Sign in to Trade"}
                </button>
              ) : (
                <button
                  onClick={tradeTab === "buy" ? handleBuy : handleSell}
                  disabled={
                    market.resolved ||
                    betLoading ||
                    !selected ||
                    !fpmmAddress ||
                    parseFloat(amount || "0") <= 0 ||
                    usdcBalance < parseFloat(amount || "0")
                  }
                  className="w-full py-3.5 bg-[#F3B21A] text-black font-bold rounded-xl hover:bg-[#D9A650] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {market.resolved
                    ? "Market Resolved"
                    : betLoading
                    ? "Processing..."
                    : !fpmmAddress
                    ? "No Trading Pool Available"
                    : usdcBalance < parseFloat(amount || "0") && parseFloat(amount || "0") > 0
                    ? "Insufficient USDT Balance"
                    : !selected
                    ? "Select an outcome"
                    : tradeTab === "buy"
                    ? `Buy ${selected} — $${amount}`
                    : `Sell ${selected} — $${amount}`}
                </button>
              )}

              <p className="text-[10px] text-[#D9A650]/35 mt-3 text-center leading-relaxed">
                Trades use USDC on {market.league?.name ?? getChainName(market.chainId)} via Gnosis
                ConditionalTokens and FPMM.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}